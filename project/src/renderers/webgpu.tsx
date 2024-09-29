/* eslint-disable @typescript-eslint/no-namespace */
/* eslint-disable react-refresh/only-export-components */
/* eslint-disable react-hooks/exhaustive-deps */
import { FC, useRef, useState, useEffect } from "react";
import { AdaptDPR as Menu } from "../renderer_utils/MenuOptions";
import { Bits, RendererDefs } from "../utils/types";
import { onColor, offColor } from "../utils/consts";
import { ArrayUtils } from "../utils/utils";
import { isNil } from "../utils/utils";

const View: FC<RendererDefs.RendererProps> = (props) => {

  const [hasDevice, setHasDevice] = useState<boolean>(false);
  const canvasRef = useRef<HTMLCanvasElement|null>(null);
  const containerRef = useRef<Container>({...initContainer});

  // initialize: setup device
  useEffect(() => {
    const container = containerRef.current;
    if (hasDevice) return;

    setUpDevice(props.notifyFailure)
    .then(device => {
      if (!isNil(device)) {
        container.device = device;
        setHasDevice(true);
      }
      else setHasDevice(false);
    });
  }, []);

  // initialize: all others
  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;

    initialize(props.notifyFailure, canvas, container);
    writeColorsToBuffer(container);
  }, [canvasRef.current, hasDevice]);

  // window resize receiver
  const windowResizeDeps = [
    canvasRef.current,
    props.windowSize,
    props.adaptDevicePixelRatio
  ];
  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;

    resize(canvas, container, props.adaptDevicePixelRatio);
  }, windowResizeDeps);

  // side resize receiver
  const sideResizeDeps = [canvasRef.current, props.side];
  useEffect(() => {
    const container = containerRef.current;

    writeSideToBuffer(props.side, container);
    createIndicesBuffer(props.side, container);
  }, sideResizeDeps);

  // state change receiver
  const stateChangeDeps = [canvasRef.current, props.bits, props.side];
  useEffect(() => {
    const container = containerRef.current;

    prepareVerticesBuffer(props.bits, props.side, container);
  }, stateChangeDeps);

  // draw
  // called when any of the above receivers triggered
  useEffect(() => {
    const container = containerRef.current;

    draw(props.side, container);
  }, [
    ...windowResizeDeps,
    ...sideResizeDeps,
    ...stateChangeDeps
  ]);

  return <canvas className="view" ref={canvasRef} />;
};

// shader source code
const shaderSource = `
  struct Colors {
    onColor: vec4<f32>,
    offColor: vec4<f32>
  };

  @group(0) @binding(0)
  var<uniform> side: f32;

  @group(0) @binding(1)
  var<uniform> colors: Colors;

  struct FragmentData {
    @builtin(position)
    position: vec4<f32>,
    @location(0)
    color: vec4<f32>
  }

  @vertex
  fn vertexMain(
    @location(0)
    coord: vec2<u32>,
    @location(1)
    value: u32
  ) -> FragmentData {
    var out: FragmentData;

    let x = f32(coord.x) / side *  2.0 - 1.0;
    let y = f32(coord.y) / side * -2.0 + 1.0;
    out.position = vec4<f32>(x,y,0.0,1.0);

    if value > 0 { out.color = colors.onColor; }
    else { out.color = colors.offColor; }

    return out;
  }

  @fragment
  fn fragmentMain(fragData: FragmentData) -> @location(0) vec4<f32> {
    return fragData.color;
  }
`;

type Canvas = HTMLCanvasElement;
type Container = typeof initContainer;
const initContainer = {
  device:                null as Nullable<GPUDevice>,
  context:               null as Nullable<GPUCanvasContext>,
  pipeline:              null as Nullable<GPURenderPipeline>,

  sideUnifBuffer:        null as Nullable<GPUBuffer>,
  colorsUnifBuffer:      null as Nullable<GPUBuffer>,

  positionsAttribBuffer: null as Nullable<GPUBuffer>,
  valuesAttribBuffer:    null as Nullable<GPUBuffer>,
  indicesBuffer:         null as Nullable<GPUBuffer>,

  bindGroup:             null as Nullable<GPUBindGroup>,
};



const setUpDevice = async (
  notifyFailure: (message: string) => void
): Promise<Nullable<GPUDevice>> => {
  // get adapter
  const adapter = await navigator.gpu.requestAdapter();
  if (isNil(adapter)) {
    notifyFailure("Failed to request GPU adapter");
    return null;
  }

  // gpu device for rendering
  try {
    const device = await adapter.requestDevice();
    return device;
  }
  catch {
    notifyFailure("Failed to get GPU device");
    return null;
  }
};

namespace Initialize {

  export const main = (
    notifyFailure: (message: string) => void,
    canvas: Nullable<Canvas>,
    container: Container
  ) => {
    const device = container.device;
    if ( isNil(device) || isNil(canvas) ) return;

    // prepare convas context
    const context = setupContext(canvas, device);
    if (isNil(context)) {
      notifyFailure("Failed to create context");
      return;
    }
    container.context = context;

    // create buffers for uniform variables
    const uniformBuffers = createUniformBuffers(device);
    container.sideUnifBuffer = uniformBuffers.side;
    container.colorsUnifBuffer = uniformBuffers.colors;

    // define structure and purpose of gpu resources
    const bindGroupLayout = createBindGroupLayout(device);

    // attach buffers to bind group
    container.bindGroup = createBindGroup(device, bindGroupLayout, uniformBuffers);

    // determines bind group to the pipeline
    const pipelineLayout = createPipelineLayout(device, bindGroupLayout);

    // executable shader module (program)
    const shaderModule = createShaderModule(device, shaderSource);

    // controlling vertex and fragment stages on each rendering, with given buffers layout
    container.pipeline = createRenderPipeline(device, shaderModule, pipelineLayout);
  };

  type UniformBuffers = {
    side: GPUBuffer;
    colors: GPUBuffer;
  }

  type SetupContext = (
    canvas: HTMLCanvasElement,
    device: GPUDevice
  ) => GPUCanvasContext | null;
  const setupContext: SetupContext = (canvas, device) => {
    const context = canvas.getContext("webgpu");
    if (isNil(context)) return null;

    context.configure({
      device: device,
      format: navigator.gpu.getPreferredCanvasFormat()
    });

    return context;
  };

  type UniformBuffersFn = (device: GPUDevice) => UniformBuffers;
  const createUniformBuffers: UniformBuffersFn = (device) => (
    {
      side: device.createBuffer({
        size: Float32Array.BYTES_PER_ELEMENT,
        usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST
      }),
      colors: device.createBuffer({
        size: Float32Array.BYTES_PER_ELEMENT * 4 * 2,
        // size of f32 * # of vector components * # of vectors
        usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST
      })
    }
  );

  type BindGroupLayoutFn = (device: GPUDevice) => GPUBindGroupLayout;
  const createBindGroupLayout: BindGroupLayoutFn = (device) => (
    device.createBindGroupLayout({
      entries: [
        {
          binding: 0,
          visibility: GPUShaderStage.VERTEX,
          buffer: { type: "uniform" }
        },
        {
          binding: 1,
          visibility: GPUShaderStage.VERTEX,
          buffer: { type: "uniform" }
        }
      ]
    })
  );

  type BindGroupFn = (device: GPUDevice, layout: GPUBindGroupLayout, buffers: UniformBuffers) => GPUBindGroup;
  const createBindGroup: BindGroupFn = (device, bindGroupLayout, uniformBuffers) => (
    device.createBindGroup({
      layout: bindGroupLayout,
      entries: [
        {
          binding: 0,
          resource: { buffer: uniformBuffers.side }
        },
        {
          binding: 1,
          resource: { buffer: uniformBuffers.colors }
        }
      ]
    })
  );

  type PipelineLayoutFn = (
    device: GPUDevice,
    bindGroupLayout: GPUBindGroupLayout
  ) => GPUPipelineLayout;
  const createPipelineLayout: PipelineLayoutFn = (device, bindGroupLayout) => (
    device.createPipelineLayout({
      bindGroupLayouts: [bindGroupLayout]
    })
  );

  type ShaderModuleFn = (device: GPUDevice, code: string) => GPUShaderModule;
  const createShaderModule: ShaderModuleFn = (device, wgslCode) => (
    device.createShaderModule({
      code: wgslCode
    })
  );

  type RenderPipelineFn = (
    device: GPUDevice,
    module: GPUShaderModule,
    layout: GPUPipelineLayout
  ) => GPURenderPipeline;
  const createRenderPipeline: RenderPipelineFn = (device, shaderModule, pipelineLayout) => (
    device.createRenderPipeline({
      // ref: https://developer.mozilla.org/en-US/docs/Web/API/GPUDevice/createRenderPipeline#parameters
      vertex: {
        module: shaderModule,
        entryPoint: "vertexMain",
        buffers: [
          {
            arrayStride: 2 * Float32Array.BYTES_PER_ELEMENT,
            attributes: [
              {
                format: "uint32x2",
                offset: 0,
                shaderLocation: 0
              }
            ]
          },
          {
            arrayStride: Float32Array.BYTES_PER_ELEMENT,
            attributes: [
              {
                format: "uint32",
                offset: 0,
                shaderLocation: 1
              }
            ]
          }
        ]
      },
      fragment: {
        module: shaderModule,
        entryPoint: "fragmentMain",
        targets: [
          {
            // 1*src + 0*dst
            blend: {
              alpha: {
                srcFactor: "one",
                dstFactor: "zero",
                operation: "add"
              },
              color: {
                srcFactor: "one",
                dstFactor: "zero",
                operation: "add"
              }
            },
            // ref: https://gpuweb.github.io/gpuweb/#texture-formats
            // unorm: unsigned normalized
            // b,g,r,a each has 8bit and thus whole value is 32bit
            format: "bgra8unorm",
            // color mask
            writeMask: GPUColorWrite.ALL
          }
        ]
      },
      primitive: {
        // Each triplet of vertices represents a triangle.
        topology: "triangle-list"
      },
      layout: pipelineLayout
    })
  );
}
const initialize = Initialize.main;

const writeColorsToBuffer = (container: Container) => {
  const { device, colorsUnifBuffer } = container;
  if ( isNil(device) || isNil(colorsUnifBuffer) ) return;

  const arrayBuffer = new ArrayBuffer(4 * 4 * 2);

  ([ [onColor, 0], [offColor, 16] ] as [Uint8ClampedArray, number][])
  .map(([color,stride]) => {
    const view = new Float32Array(arrayBuffer, stride, 4);
    view.set(
      Array.from(color).map(value => value/255)
    );
  });

  device.queue.writeBuffer(colorsUnifBuffer, 0, arrayBuffer);
};

const writeSideToBuffer = (side: number, container: Container) => {
  const { device, sideUnifBuffer } = container;
  if ( isNil(device) || isNil(sideUnifBuffer) ) return;

  const arrayBuffer = new ArrayBuffer(4);
  const dataView = new DataView(arrayBuffer);
  dataView.setFloat32(0, side, true);

  device.queue.writeBuffer(sideUnifBuffer, 0, arrayBuffer);
};

const createIndicesBuffer = (side: number, container: Container) => {
  const {
    device, indicesBuffer: oldIndicesBuffer
  } = container;
  if (isNil(device)) return;
  if (!isNil(oldIndicesBuffer)) oldIndicesBuffer.destroy();

  const indicesCount = (side**2) * 6;

  container.indicesBuffer = device.createBuffer({
    size: indicesCount * Uint16Array.BYTES_PER_ELEMENT,
    usage: GPUBufferUsage.INDEX | GPUBufferUsage.COPY_DST
  });
};

const prepareVerticesBuffer = (
  bits: Bits, side: number, container: Container
) => {
  const {
    device, indicesBuffer,
    positionsAttribBuffer: oldPositionsBuffer,
    valuesAttribBuffer: oldValuesBuffer
  } = container;
  if ( isNil(device) || isNil(indicesBuffer) ) return;

  // is bits size is apropriate value to side?
  if ( side**2 !== bits.length || side === 0 ) return;

  oldPositionsBuffer?.destroy();
  oldValuesBuffer?.destroy();

  const arrays = ArrayUtils.getVertices(bits, side);
  if (isNil(arrays)) return;
  const { positions, values, indices } = arrays;

  const positionsView = new Uint32Array(positions);
  const positionsAttribBuffer = device.createBuffer({
    size: positionsView.byteLength,
    usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST
  });
  device.queue.writeBuffer(
    positionsAttribBuffer, 0,
    positionsView, 0, positions.length
  );
  container.positionsAttribBuffer = positionsAttribBuffer;

  const valuesView = new Uint32Array(values.map(value => value ? 1 : 0));
  const valuesAttribBuffer = device.createBuffer({
    size: valuesView.byteLength,
    usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST
  });
  device.queue.writeBuffer(
    valuesAttribBuffer, 0,
    valuesView, 0, values.length
  );
  container.valuesAttribBuffer = valuesAttribBuffer;

  const indicesView = new Uint16Array(indices);
  device.queue.writeBuffer(
    indicesBuffer, 0,
    indicesView, 0, indices.length
  );
};

const resize = (
  canvas: Nullable<Canvas>,
  container: Container,
  adaptDevicePixelRatio: boolean
) => {
  const { context } = container;
  if ( isNil(canvas) || isNil(context) ) return;

  const bcr = canvas.getBoundingClientRect();
  const dpr = adaptDevicePixelRatio ? window.devicePixelRatio : 1;

  const width = bcr.width * dpr;
  const height = bcr.height * dpr;
  canvas.width = width;
  canvas.height = height;
};

namespace Draw {

  export const main = (side: number, container: Container) => {
    const { device, context, pipeline, bindGroup, positionsAttribBuffer, valuesAttribBuffer, indicesBuffer } = container;

    if ( isNil(device) || isNil(context) || isNil(pipeline) || isNil(bindGroup) || isNil(positionsAttribBuffer) || isNil(valuesAttribBuffer) || isNil(indicesBuffer) ) return;
    if (side === 0) return;

    const indicesCount = (side**2) * 6;

    const commandBuffer =
    recordCommands(device, (commandEncoder) => {

      const textureView = getCurrentTextureView(context);

      recordRenderCommands(
        commandEncoder, textureView,
        (renderPassEncoder) => {

          // set the shader module with the vertex and fragment info
          renderPassEncoder.setPipeline(pipeline);

          renderPassEncoder.setBindGroup(0, bindGroup);

          renderPassEncoder.setVertexBuffer(0, positionsAttribBuffer, 0);
          renderPassEncoder.setVertexBuffer(1, valuesAttribBuffer, 0);

          renderPassEncoder.setIndexBuffer(indicesBuffer, "uint16");

          renderPassEncoder.drawIndexed(
            indicesCount, 1,
            0, 0, 0
          );

        }
      );

    });

    // put the buffered commands into the queue of GPU
    device.queue.submit([commandBuffer]);
  };

  type GetCurrentTextureView = (context: GPUCanvasContext) => GPUTextureView;
  const getCurrentTextureView: GetCurrentTextureView = (context) => {
    // a texture of color attachment as an output of rendering
    const texture = context.getCurrentTexture();

    // a view that we can see in the texture
    const textureView = texture.createView();
    return textureView;
  };

  type RecordCommands = (
    device: GPUDevice,
    func: (encoder: GPUCommandEncoder) => void
  ) => GPUCommandBuffer;
  const recordCommands: RecordCommands = (device, func) => {
    // an object to encode (create) commands sent to GPU
    const commandEncoder = device.createCommandEncoder();

    // call the function to setup commands
    func(commandEncoder);

    // finish recording of all commands
    // recorded commands are buffered in the GPUCommandBuffer
    const commandBuffer = commandEncoder.finish();
    return commandBuffer;
  };

  type RecordRenderCommands = (
    commandEncoder: GPUCommandEncoder,
    view: GPUTextureView,
    func: (encoder: GPURenderPassEncoder) => void
  ) => void;
  const recordRenderCommands: RecordRenderCommands = (commandEncoder, textureView, func) => {
    // create GPU commands of especially rendering
    // the commands are part of the whole commands in GPUCommandEncoder
    // commands are recorded in the called order
    const renderPassEncoder = commandEncoder.beginRenderPass({
      // ref: https://developer.mozilla.org/en-US/docs/Web/API/GPUCommandEncoder/beginRenderPass#parameters
      colorAttachments: [
        {
          view: textureView,
          // load operation of existing image (executed before render pass)
          loadOp: "clear",
          clearValue: { r: 0, g: 0, b: 0, a: 0 },
          // store operation of drawn image (executed after render pass)
          storeOp: "store"
        }
      ]
    });

    // call the function to setup render commands
    func(renderPassEncoder);

    // finish recording of rendering commands
    renderPassEncoder.end();
  };

}
const draw = Draw.main;



export const renderer : RendererDefs.Renderer = {
  name: "WebGPU",
  isActive: !isNil(navigator.gpu),
  view: View,
  menu: Menu
};