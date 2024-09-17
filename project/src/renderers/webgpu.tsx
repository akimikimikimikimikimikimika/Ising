/* eslint-disable @typescript-eslint/no-namespace */
/* eslint-disable react-refresh/only-export-components */
/* eslint-disable react-hooks/exhaustive-deps */
import { FC, useRef, useState, useEffect } from "react";
import { AdaptDPR as Menu } from "../renderer_utils/MenuOptions";
import { Bits, RendererDefs } from "../utils/types";
import { onColor, offColor } from "../utils/consts";
import { isNil } from "../utils/type_check";

const View: FC<RendererDefs.RendererProps> = (props) => {

  const [device, setDevice] = useState<Nullable<GPUDevice>>(null);

  const canvasRef = useRef<HTMLCanvasElement|null>(null);
  const contextRef = useRef<Nullable<GPUCanvasContext>>(null);

  const pipelineRef = useRef<Nullable<GPURenderPipeline>>(null);

  const verticesBufferRef = useRef<Nullable<GPUBuffer>>(null);
  const sideBufferRef = useRef<Nullable<GPUBuffer>>(null);
  const colorsBufferRef = useRef<Nullable<GPUBuffer>>(null);
  const bindGroupRef = useRef<Nullable<GPUBindGroup>>(null);

  // drawing info
  type Info = {
    width: number, height: number,
    side: number
  };
  const infoRef = useRef<Info>({
    width: 0, height: 0, side: 0
  });

  // initialize: setup device
  useEffect(() => {
    (async () => {
      if (!isNil(device)) return;

      const adapter = await navigator.gpu.requestAdapter();
      if (isNil(adapter)) {
        props.notifyFailure("Failed to request GPU adapter");
        return;
      }

      // gpu device for rendering
      const newDevice = await adapter.requestDevice();
      setDevice(newDevice);
    })();
  }, []);

  // initialize: create context, prepare uniform buffers, prepare render pipeline
  useEffect(() => {
    if (isNil(device)) return;
    const canvas = canvasRef.current;
    if (isNil(canvas)) return;

    // run initialize process
    const output = procedures.initialize(
      props.notifyFailure, canvas, device
    );
    if (isNil(output)) return;

    const {
      context, sideBuffer, colorsBuffer,
      bindGroup, pipeline
    } = output;
    contextRef.current = context;
    sideBufferRef.current = sideBuffer;
    colorsBufferRef.current = colorsBuffer;
    bindGroupRef.current = bindGroup;
    pipelineRef.current = pipeline;

    // set colors to colors buffer
    procedures.setColors(device, colorsBuffer);
  }, [canvasRef.current, device]);

  // window resize receiver
  useEffect(() => {
    const canvas = canvasRef.current;
    const context = contextRef.current;
    if ( isNil(canvas) || isNil(context) ) return;

    const bcr = canvas.getBoundingClientRect();
    const dpr = props.adaptDevicePixelRatio ? window.devicePixelRatio : 1;

    const width = bcr.width * dpr;
    const height = bcr.height * dpr;
    canvas.width = width;
    canvas.height = height;

    infoRef.current.width = width;
    infoRef.current.height = height;
  }, [
    canvasRef.current,
    props.windowSize,
    props.adaptDevicePixelRatio
  ]);

  // side resize receiver
  useEffect(() => {
    if (isNil(device)) return;
    const sideBuffer = sideBufferRef.current;
    if (isNil(sideBuffer)) return;

    procedures.writeSideToBuffer(props.side, device, sideBuffer);

    const verticesBuffer = procedures.createVerticesBufferFromSide(props.side, device);
    verticesBufferRef.current = verticesBuffer;

    infoRef.current.side = props.side;

    return () => verticesBuffer.destroy();
  }, [canvasRef.current, props.side]);

  // state change receiver
  useEffect(() => {
    if (isNil(device)) return;
    const verticesBuffer = verticesBufferRef.current;
    if (isNil(verticesBuffer)) return;

    // is bits size is apropriate value to side?
    const side = infoRef.current.side;
    if ( side**2 !== props.bits.length || side === 0 ) return;

    procedures.writeBitsToVerticesBuffer(props.bits, side, device, verticesBuffer);
  }, [canvasRef.current, props.bits, props.side]);

  // draw
  // called when any of the above changes occured
  useEffect(() => {
    const context = contextRef.current;
    if (isNil(context)) return;
    if (isNil(device)) return;
    const pipeline = pipelineRef.current;
    if (isNil(pipeline)) return;
    const verticesBuffer = verticesBufferRef.current;
    if (isNil(verticesBuffer)) return;
    const bindGroup = bindGroupRef.current;
    if (isNil(bindGroup)) return;
    const info = infoRef.current;

    if ( infoRef.current.side === 0 ) return;

    const commandBuffer =
    procedures.recordCommands(device, (commandEncoder) => {

      const textureView = procedures.getCurrentTextureView(context);

      procedures.recordRenderCommands(
        commandEncoder, textureView, (renderPassEncoder) => {

          // set the shader module with the vertex and fragment info
          renderPassEncoder.setPipeline(pipeline);

          renderPassEncoder.setBindGroup(0, bindGroup);

          renderPassEncoder.setVertexBuffer(0, verticesBuffer, 0);

          renderPassEncoder.draw(
            (info.side**2) * 6, 1, 0, 0
          );

        }
      );

    });

    // put the buffered commands into the queue of GPU
    device.queue.submit([commandBuffer]);
  }, [
    canvasRef.current, device,
    props.windowSize,
    props.adaptDevicePixelRatio,
    props.side,
    props.bits
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
    coord: vec2<f32>,
    @location(1)
    bit: f32
  ) -> FragmentData {
    var out: FragmentData;

    let x = coord.x / side *  2.0 - 1.0;
    let y = coord.y / side * -2.0 + 1.0;
    out.position = vec4<f32>(x,y,0.0,1.0);
    out.color = colors.onColor * bit + colors.offColor * (1.0-bit);

    return out;
  }

  @fragment
  fn fragmentMain(fragData: FragmentData) -> @location(0) vec4<f32> {
    return fragData.color;
  }
`;

// procedures
namespace procedures {

  namespace initializeImpl {

    type Output = {
      context: GPUCanvasContext;
      sideBuffer: GPUBuffer;
      colorsBuffer: GPUBuffer;
      bindGroup: GPUBindGroup;
      pipeline: GPURenderPipeline;
    };

    type InitializeMain = (
      notifyFailure: (message: string) => void,
      canvas: HTMLCanvasElement,
      device: GPUDevice
    ) => Nullable<Output>;

    export const main: InitializeMain = (notifyFailure, canvas, device) => {
      // prepare convas context
      const context = setupContext(canvas, device);
      if (isNil(context)) {
        notifyFailure("Failed to create context");
        return;
      }

      // create buffers for uniform variables
      const uniformBuffers = createUniformBuffers(device);

      // define structure and purpose of gpu resources
      const bindGroupLayout = createBindGroupLayout(device);

      // attach buffers to bind group
      const bindGroup = createBindGroup(device, bindGroupLayout, uniformBuffers);

      // determines bind group to the pipeline
      const pipelineLayout = createPipelineLayout(device, bindGroupLayout);

      // executable shader module (program)
      const shaderModule = createShaderModule(device, shaderSource);

      // controlling vertex and fragment stages on each rendering, with given buffers layout
      const pipeline = createRenderPipeline(device, shaderModule, pipelineLayout);

      return {
        context,
        sideBuffer: uniformBuffers.side,
        colorsBuffer: uniformBuffers.colors,
        bindGroup, pipeline
      };
    };

    type UniformBuffers = {
      side: GPUBuffer;
      colors: GPUBuffer;
    }

    type SetupContext = (canvas: HTMLCanvasElement, device: GPUDevice) => GPUCanvasContext | null;
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
          size: 4, // size of u32
          usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST
        }),
        colors: device.createBuffer({
          size: 4 * 4 * 2, // size of u32 * # of vector components * # of vectors
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
              arrayStride: 3*4,
              attributes: [
                {
                  format: "float32x2",
                  offset: 0,
                  shaderLocation: 0
                },
                {
                  format: "float32",
                  offset: 2*4,
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
  export const initialize = initializeImpl.main;

  type SetColors = (device: GPUDevice, buffer: GPUBuffer) => void;
  export const setColors: SetColors = (device, colorsBuffer) => {
    const arrayBuffer = new ArrayBuffer(4 * 4 * 2);

    ([ [onColor, 0], [offColor, 16] ] as [Uint8ClampedArray, number][])
    .map(([color,stride]) => {
      const view = new Float32Array(arrayBuffer, stride, 4);
      view.set(
        Array.from(color).map(value => value/255)
      );
    });

    device.queue.writeBuffer(colorsBuffer, 0, arrayBuffer);
  };

  type WriteSideToBuffer = (side: number, device: GPUDevice, buffer: GPUBuffer) => void;
  export const writeSideToBuffer: WriteSideToBuffer = (side, device, buffer) => {
    const arrayBuffer = new ArrayBuffer(4);
    const dataView = new DataView(arrayBuffer);
    dataView.setFloat32(0, side, true);

    device.queue.writeBuffer(buffer, 0, arrayBuffer);
  };

  type CreateVerticesBufferFromSide = (side: number, device: GPUDevice) => GPUBuffer;
  export const createVerticesBufferFromSide: CreateVerticesBufferFromSide = (side, device) => (
    device.createBuffer({
      // # of cells * # of vertices in a cell * (x,y,value) * size of float32
      size: (side**2) * 6 * 3 * 4,
      // ref: https://developer.mozilla.org/en-US/docs/Web/API/GPUBuffer/usage#value
      usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST
    })
  );

  type WriteBitsToVerticesBuffer = (bits: Bits, side: number, device: GPUDevice, buffer: GPUBuffer) => void;
  export const writeBitsToVerticesBuffer: WriteBitsToVerticesBuffer = (bits, side, device, verticesBuffer) => {
    const verticesArray = new Float32Array(
      bits.map((value, idx) => {
        const x = idx % side;
        const y = Math.floor( idx / side );

        return verticesInCell.map(({ x: dx, y: dy }) => ([
          x + dx, y + dy,
          value ? 1 : 0
        ])).flat();
      }).flat()
    );

    device.queue.writeBuffer(
      verticesBuffer, 0,
      verticesArray, 0, verticesArray.length
    );
  };

  type GetCurrentTextureView = (context: GPUCanvasContext) => GPUTextureView;
  export const getCurrentTextureView: GetCurrentTextureView = (context) => {
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
  export const recordCommands: RecordCommands = (device, func) => {
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
    encoder: GPUCommandEncoder,
    view: GPUTextureView,
    func: (encoder: GPURenderPassEncoder) => void
  ) => void;
  export const recordRenderCommands: RecordRenderCommands = (commandEncoder, textureView, func) => {
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

type Point = { x: number; y: number; };
const verticesInCell: Point[] = [
  { x: 0, y: 0 }, { x: 0, y: 1 }, { x: 1, y: 0 }, { x: 0, y: 1 }, { x: 1, y: 0 }, { x: 1, y: 1 }
];

export const renderer : RendererDefs.Renderer = {
  name: "WebGPU",
  isActive: !isNil(navigator.gpu),
  view: View,
  menu: Menu
};