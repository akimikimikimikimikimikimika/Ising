/* eslint-disable react-refresh/only-export-components */
/* eslint-disable @typescript-eslint/no-namespace */
/* eslint-disable react-hooks/exhaustive-deps */
import { FC, useRef, useEffect, useCallback } from "react";
import { AdaptDPR as Menu } from "../renderer_utils/MenuOptions";
import { RendererDefs } from "../utils/types";
import { onColor, offColor } from "../utils/consts";
import { ArrayUtils } from "../utils/utils";
import { isNil } from "../utils/type_check";

const View: FC<RendererDefs.RendererProps> = (props) => {

  // canvas
  const canvasRef = useRef<Canvas|null>(null);

  // canvas context
  const contextRef = useRef<Nullable<Context>>(null);

  // uniform / attribute locations & buffers
  const varsRef = useRef<Nullable<Variables>>(null);

  // arrays
  const arraysRef = useRef<Nullable<Arrays>>(null);

  // initialize program
  useEffect(() => {
    const canvas = canvasRef.current;
    if (glMode === "none") return;
    if (isNil(canvas)) return;

    // get context from canvas
    const context =
      canvas.getContext(glMode) as Context|null;
    if (isNil(context)) {
      props.notifyFailure("Failed to create context");
      return;
    }
    contextRef.current = context;

    varsRef.current = initialize(context, props.notifyFailure);
  }, [contextRef.current]);

  // resize receiver
  useEffect(() => {
    const canvas = canvasRef.current;
    const context = contextRef.current;
    if ( isNil(canvas) || isNil(context) ) return;

    resize(canvas, context, props.adaptDevicePixelRatio);
    draw();
  }, [canvasRef.current, props.windowSize, props.adaptDevicePixelRatio]);

  // state change receiver
  useEffect(() => {
    const arrays = ArrayUtils.getVertices(props.bits, props.side);
    if (isNil(arrays)) return;
    arraysRef.current = arrays;

    draw();
  }, [props.bits]);

  // draw function
  const draw = useCallback(() => {
    const context = contextRef.current;
    const vars = varsRef.current;
    const arrays = arraysRef.current;
    if ( isNil(context) || isNil(vars) || isNil(arrays) ) return;

    Draw.main(context, vars, arrays, props.side);
  }, [props.side]);

  return <canvas className="view" ref={canvasRef} />;
};



// set WebGL mode
// can be set to the argument of canvas.getContext
type GLMode = "webgl" | "webgl2" | "none";
const glMode: GLMode = (
  !isNil(window.WebGL2RenderingContext) ?
  "webgl2" :
  !isNil(window.WebGLRenderingContext) ?
  "webgl" :
  "none"
);

// WebGL Rendering Context prototypes
export const prototype = (() => {
  switch (glMode) {
    case "webgl": return window.WebGLRenderingContext;
    case "webgl2": return window.WebGL2RenderingContext;
    default: return null;
  }
})() as Nullable<Context>;



// shader type and source code
const shaders: Shader[] = [
  {
    type: prototype?.VERTEX_SHADER,
    code: `
      attribute vec2 position;
      attribute float value;
      uniform int side;

      varying float varyingValue;

      void main() {
        float x = float(position.x) / float(side);
        float y = float(position.y) / float(side);
        float normX = -1.0 + 2.0 * x;
        float normY = +1.0 - 2.0 * y;
        gl_Position = vec4( normX, normY, 0.0, 1.0 );

        varyingValue = value;
      }
    `
  },
  {
    type: prototype?.FRAGMENT_SHADER,
    code: `
      precision mediump float;
      uniform vec4 onColor;
      uniform vec4 offColor;

      varying float varyingValue;

      void main() {
        gl_FragColor = varyingValue > 0.5 ? onColor : offColor;
      }
    `
  }
];
type Shader = { type: Nullable<GLenum>; code: string; };

type Canvas = HTMLCanvasElement;
type Context = WebGL2RenderingContext | WebGLRenderingContext;

type Variables = {
  sideUnifLoc: WebGLUniformLocation;
  onColorUnifLoc: WebGLUniformLocation;
  offColorUnifLoc: WebGLUniformLocation;
  positionsAttribLoc: GLint;
  valuesAttribLoc: GLint;
  positionsBuffer: WebGLBuffer;
  valuesBuffer: WebGLBuffer;
  indicesBuffer: WebGLBuffer;
};
type Arrays = ArrayUtils.VerticesArrays;

type ErrFunc = (message?:string) => void;



// a routine when it is being initialized
export const initialize = (
  context: Context,
  errorReporter: ErrFunc
): Nullable<Variables> => {
  try { return Initialize.main(context); }
  catch (e) {
    errorReporter( (e as Error).message );
  }
};

// implementation of initialization
namespace Initialize {

  export const main = (context: Context): Variables => {
    const program = createProgram(context);
    for (const shader of shaders) Shader.setUp(context, program, shader);
    linkProgram(context, program);
    context.useProgram(program);
    const vars = setupVariables(context, program);
    return vars;
  }

  const createProgram = (context: Context): WebGLProgram => {
    const program = context.createProgram();
    if (isNil(program)) {
      throw Error("Failed to create program");
    }
    return program;
  };

  namespace Shader {

    export const setUp = (context: Context, program: WebGLProgram, shaderInfo: Shader) => {
      const shader = createShader(context, shaderInfo);
      compileShader(context, shader);
      attachShader(context, program, shader);
    };

    const createShader = (context: Context, shaderInfo: Shader): WebGLShader => {
      const { type, code } = shaderInfo;

      const shader = context.createShader(type!);
      if (isNil(shader)) {
        throw Error("Failed to create shader");
      }

      context.shaderSource(shader, code);

      return shader;
    };

    const compileShader = (context: Context, shader: WebGLShader) => {
      context.compileShader(shader);

      const param = context.getShaderParameter(shader,context.COMPILE_STATUS);

      if (!param) {
        const log = context.getShaderInfoLog(shader);
        let msg = "Failed to compile shader";
        if (!isNil(log)) msg += ` (${log})`;
        throw Error(msg);
      }
    };

    const attachShader = (context: Context, program: WebGLProgram, shader: WebGLShader) => {
      context.attachShader(program, shader);
    };

  }

  const linkProgram = (context: Context, program: WebGLProgram) => {
    context.linkProgram(program);

    const param = context.getProgramParameter(program, context.LINK_STATUS);

    if (!param) {
      const log = context.getProgramInfoLog(program);
      let msg = "Failed to link program";
      if (!isNil(log)) msg += ` (${log})`;
      throw Error(msg);
    }

  };

  const setupVariables = (context: Context, program: WebGLProgram): Variables => {

    const sideUnifLoc = context.getUniformLocation(program, "side");
    if (isNil(sideUnifLoc)) throw Error("Failed to get uniform location of side");

    const onColorUnifLoc = context.getUniformLocation(program, "onColor");
    if (isNil(onColorUnifLoc)) throw Error("Failed to get uniform location of onColor");

    const offColorUnifLoc = context.getUniformLocation(program, "offColor");
    if (isNil(offColorUnifLoc)) throw Error("Failed to get uniform location of offColor");

    const positionsAttribLoc = context.getAttribLocation(program, "position");
    if (isNil(positionsAttribLoc)) throw Error("Failed to get attribute location of position");

    const valuesAttribLoc = context.getAttribLocation(program, "value");
    if (isNil(valuesAttribLoc)) throw Error("Failed to get attribute location of value");

    const positionsBuffer = context.createBuffer();
    if (isNil(positionsBuffer)) throw Error("Failed to create buffer");

    const valuesBuffer = context.createBuffer();
    if (isNil(valuesBuffer)) throw Error("Failed to create buffer");

    const indicesBuffer = context.createBuffer();
    if (isNil(indicesBuffer)) throw Error("Failed to create buffer");

    return {
      sideUnifLoc, onColorUnifLoc, offColorUnifLoc,
      positionsAttribLoc, valuesAttribLoc,
      positionsBuffer, valuesBuffer, indicesBuffer
    };
  };

}

// a routine when it is being resized
export const resize = (
  canvas: Canvas, context: Context,
  adaptDevicePixelRatio: boolean
) => {
  const bcr = canvas.getBoundingClientRect();
  const dpr = adaptDevicePixelRatio ? window.devicePixelRatio : 1;

  const width = bcr.width * dpr;
  const height = bcr.height * dpr;
  canvas.width = width;
  canvas.height = height;

  context.viewport(0,0,width,height);
};

// implementation of draw
namespace Draw {

  export const main = (
    context: Context,
    vars: Variables,
    arrays: Arrays,
    side: number
  ) => {
    clear(context);

    const onColorFloat = new Float32Array([...onColor].map(v => v/255));
    const offColorFloat = new Float32Array([...offColor].map(v => v/255));

    context.uniform1i(vars.sideUnifLoc, side);
    context.uniform4fv(vars.onColorUnifLoc, onColorFloat);
    context.uniform4fv(vars.offColorUnifLoc, offColorFloat);

    sendDataToBuffer(
      context,
      context.ARRAY_BUFFER,
      vars.positionsBuffer,
      new Float32Array(arrays.positions)
    );
    activateAttribute(context, vars.positionsAttribLoc, 2);

    sendDataToBuffer(
      context,
      context.ARRAY_BUFFER,
      vars.valuesBuffer,
      new Float32Array(arrays.values.map(value => value ? 1 : 0))
    );
    activateAttribute(context, vars.valuesAttribLoc, 1);

    sendDataToBuffer(
      context,
      context.ELEMENT_ARRAY_BUFFER,
      vars.indicesBuffer,
      new Uint16Array(arrays.indices)
    );

    const vertices = 6 * (side**2);
    draw(context, vertices);
  };

  const clear = (context: Context) => {
    context.clearColor(0,0,0,0);
    context.clear(context.COLOR_BUFFER_BIT);
  };

  const sendDataToBuffer = (
    context: Context,
    target: GLenum,
    buffer: WebGLBuffer,
    data: AllowSharedBufferSource
  ) => {
    context.bindBuffer(target, buffer);
    context.bufferData(
      target, data,
      context.STATIC_DRAW
    );
  };

  const activateAttribute = (
    context: Context,
    location: GLint,
    size: number
  ) => {
    context.enableVertexAttribArray(location);
    context.vertexAttribPointer(
      location, size,
      context.FLOAT,
      false,
      0, 0
    );
  };

  const draw = (
    context: Context,
    vertices: number
  ) => {
    context.drawElements(
      context.TRIANGLES,
      vertices,
      context.UNSIGNED_SHORT,
      0
    );
  };

};



export const renderer : RendererDefs.Renderer = {
  name: glMode === "webgl2" ? "WebGL 2" : "WebGL",
  isActive: glMode !== "none",
  view: View,
  menu: Menu
};