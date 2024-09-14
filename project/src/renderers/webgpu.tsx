/* eslint-disable react-refresh/only-export-components */
/* eslint-disable react-hooks/exhaustive-deps */
import { FC, useRef, useState, useEffect } from "react";
import { AdaptDPR as Menu } from "../renderer_utils/MenuOptions";
import { RendererDefs } from "../utils/types";
import { isNil } from "../utils/type_check";

const View: FC<RendererDefs.RendererProps> = (props) => {

  const canvasRef = useRef<HTMLCanvasElement|null>(null);
  const contextRef = useRef<Nullable<GPUCanvasContext>>(null);
  const [device, setDevice] = useState<Nullable<GPUDevice>>(null);
  const pipelineRef = useRef<Nullable<GPURenderPipeline>>(null);
  const vertexBufferRef = useRef<Nullable<GPUBuffer>>(null);

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

  // initialize: create context
  useEffect(() => {
    if (isNil(device)) return;

    const canvas = canvasRef.current;
    if (isNil(canvas)) return;

    const context =
      canvas.getContext("webgpu");
    if (isNil(context)) {
      props.notifyFailure("Failed to create context");
      return;
    }
    contextRef.current = context;

    // configure
    context.configure({
      device: device,
      format: navigator.gpu.getPreferredCanvasFormat()
    });
  }, [canvasRef.current, device]);

  // initialize: shader module
  useEffect(() => {
    if (isNil(device)) return;

    // executable shader module (program)
    const module = device.createShaderModule({
      code: shaderSource
    });

    // ctontrolling vertex and fragment stages on each rendering
    const pipeline = device.createRenderPipeline(
      makePipelineDescriptor(module)
    );
    pipelineRef.current = pipeline;
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

    vertexBufferRef.current = device.createBuffer({
      // # of cells * # of vertices in a cell * (x,y,value) * size of float32
      size: (props.side**2) * 6 * 3 * 4,
      // ref: https://developer.mozilla.org/en-US/docs/Web/API/GPUBuffer/usage#value
      usage: GPUBufferUsage.COPY_DST | GPUBufferUsage.VERTEX
    });

    infoRef.current.side = props.side;
  }, [canvasRef.current, props.side]);

  // state change receiver
  useEffect(() => {
    if (isNil(device)) return;
    const vertexBuffer = vertexBufferRef.current;
    if (isNil(vertexBuffer)) return;

    const side = infoRef.current.side;
    if ( side**2 !== props.bits.length || side === 0 ) return;

    const verticesArray = new Float32Array(
      props.bits.map((value, idx) => {
        const x = idx % side;
        const y = Math.floor( idx / side );

        return verticesInCell.map(({ x: dx, y: dy }) => ([
          ( x + dx ) / side *  2 - 1,
          ( y + dy ) / side * -2 + 1,
          value ? 1 : 0
        ])).flat();
      }).flat()
    );

    device.queue.writeBuffer(
      vertexBuffer, 0,
      verticesArray, 0, verticesArray.length
    );
  }, [canvasRef.current, props.bits, props.side]);

  // draw
  // called when any of the above changes occured
  useEffect(() => {
    const context = contextRef.current;
    if (isNil(context)) return;
    if (isNil(device)) return;
    const pipeline = pipelineRef.current;
    if (isNil(pipeline)) return;
    const vertexBuffer = vertexBufferRef.current;
    if (isNil(vertexBuffer)) return;
    const info = infoRef.current;

    if ( infoRef.current.side === 0 ) return;

    // an object to encode (create) commands sent to GPU
    const commandEncoder = device.createCommandEncoder();

    // a texture of color attachment as an output of rendering
    const texture = context.getCurrentTexture();

    // a view that we can see in the texture
    const textureView = texture.createView();

    // create GPU commands of especially rendering
    // the commands are part of the whole commands in GPUCommandEncoder
    // commands are recorded in the called order
    const renderPassEncoder = commandEncoder.beginRenderPass(
      makeRenderPassDescritor(textureView)
    );

    // set the shader module with the vertex and fragment info
    renderPassEncoder.setPipeline(pipeline);

    renderPassEncoder.setVertexBuffer(0, vertexBuffer, 0);

    renderPassEncoder.draw(
      (info.side**2) * 6, 1, 0, 0
    );

    // finish recording of rendering commands
    renderPassEncoder.end();

    // finish recording of all commands
    // recorded commands are buffered in the GPUCommandBuffer
    const commandBuffer = commandEncoder.finish();

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
  struct FragmentData {
    @builtin(position) position: vec4<f32>,
    @location(0) color: vec4<f32>
  }

  @vertex fn vertexMain(@location(0) coord: vec2<f32>, @location(1) bit: f32) -> FragmentData {
    var out: FragmentData;

    out.position = vec4<f32>(coord,0.0,1.0);
    out.color = vec4<f32>(0.4,0.4,0.0,1.0) + vec4<f32>(0.6,0.6,0.6,0.0) * bit;

    return out;
  }

  @fragment fn fragmentMain(fragData: FragmentData) -> @location(0) vec4<f32> {
    return fragData.color;
  }
`;

// an option object for creating render pipeline
const makePipelineDescriptor: MakePipelineDescritor = (module) => ({
  // ref: https://developer.mozilla.org/en-US/docs/Web/API/GPUDevice/createRenderPipeline#parameters
  vertex: {
    module: module,
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
    module: module,
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
  layout: "auto"
});
type MakePipelineDescritor =
  (module: GPUShaderModule) => GPURenderPipelineDescriptor;

const makeRenderPassDescritor: MakeRenderPassDescriptor = (view) => ({
  // ref: https://developer.mozilla.org/en-US/docs/Web/API/GPUCommandEncoder/beginRenderPass#parameters
  colorAttachments: [
    {
      view: view,
      // load operation of existing image (executed before render pass)
      loadOp: "clear",
      clearValue: { r: 0, g: 0, b: 0, a: 0 },
      // store operation of drawn image (executed after render pass)
      storeOp: "store"
    }
  ]
});
type MakeRenderPassDescriptor = (textureView: GPUTextureView) => GPURenderPassDescriptor;

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