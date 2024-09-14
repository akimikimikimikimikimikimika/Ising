/* eslint-disable react-refresh/only-export-components */
/* eslint-disable @typescript-eslint/no-namespace */
/* eslint-disable react-hooks/exhaustive-deps */
import { FC, useRef, useEffect, useCallback } from "react";
import { AdaptDPR as Menu } from "../renderer_utils/MenuOptions";
import { Bits, RendererDefs } from "../utils/types";
import { onColor, offColor } from "../utils/consts";
import { isNil } from "../utils/type_check";

const View: FC<RendererDefs.RendererProps> = (props) => {

  // canvas
  const canvasRef = useRef<Types.Canvas|null>(null);

  // canvas context
  const contextRef = useRef<Nullable<Types.Context>>(null);

  // uniform / attribute locations & buffers
  const varsRef = useRef<Nullable<Types.Variables>>(null);

  // arrays
  const arraysRef = useRef<Nullable<Types.Arrays>>(null);

  // initialize program
  useEffect(() => {
    const canvas = canvasRef.current;
    if (glMode === "none") return;
    if (isNil(canvas)) return;

    // get context from canvas
    const context =
      canvas.getContext(glMode) as Types.Context|null;
    if (isNil(context)) {
      props.notifyFailure("Failed to create context");
      return;
    }
    contextRef.current = context;

    varsRef.current = GLCommands.initialize(context, props.notifyFailure);
  }, [contextRef.current]);

  // resize receiver
  useEffect(() => {
    const canvas = canvasRef.current;
    const context = contextRef.current;
    if ( isNil(canvas) || isNil(context) ) return;

    GLCommands.resize(canvas, context, props.adaptDevicePixelRatio);
    draw();
  }, [canvasRef.current, props.windowSize, props.adaptDevicePixelRatio]);

  // state change receiver
  useEffect(() => {
    const arrays = convertData(props.bits,props.side);
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

    GLCommands.draw(context, vars, arrays, props.side);
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
})() as Nullable<Types.Context>;

// shader type and source code
const shaders: Types.Shader[] = [
  {
    type: prototype?.VERTEX_SHADER,
    code: `
      attribute vec3 position;
      uniform int pixel;

      varying float spin;

      void main() {
        vec2 p = position.xy/float(pixel);
        gl_Position = vec4(-1.0+p.x*2.0,+1.0-p.y*2.0,0.0,1.0);
        spin = position.z;
      }
    `
  },
  {
    type: prototype?.FRAGMENT_SHADER,
    code: `
      precision mediump float;
      uniform vec4 onColor;
      uniform vec4 offColor;

      varying float spin;

      void main() {
        gl_FragColor = spin * onColor + (1.0-spin) * offColor;
      }
    `
  }
];

// type definitions
namespace Types {

  export type Canvas = HTMLCanvasElement;

  export type Context = WebGL2RenderingContext | WebGLRenderingContext;

  export type Shader = { type: Nullable<GLenum>; code: string; };

  export type Variables = {
    pixelLoc: WebGLUniformLocation;
    onColorLoc: WebGLUniformLocation;
    offColorLoc: WebGLUniformLocation;
    positionsLoc: GLint;
    positionsBuf: WebGLBuffer;
    indicesBuf: WebGLBuffer;
  };

  export type Arrays = {
    positions: Float32Array;
    indices: Int16Array;
  };

  export type ErrFunc = (message?:string) => void;

}

// routines of gl command calls
namespace GLCommands {

  // a routine when it is being initialized
  export const initialize = (
    context: Types.Context,
    errorReporter: Types.ErrFunc
  ): Nullable<Types.Variables> => {
    try { return Initialize.main(context); }
    catch (e) {
      errorReporter( (e as Error).message );
    }
  };

  // implementation of initialization
  namespace Initialize {

    export const main = (context: Types.Context): Types.Variables => {
      const program = createProgram(context);
      for (const shader of shaders) Shader.setUp(context, program, shader);
      linkProgram(context, program);
      // eslint-disable-next-line react-hooks/rules-of-hooks
      const vars = useProgram(context, program);
      return vars;
    }

    const createProgram = (context: Types.Context): WebGLProgram => {
      const program = context.createProgram();
      if (isNil(program)) {
        throw Error("Failed to create program");
      }
      return program;
    };

    namespace Shader {

      export const setUp = (context: Types.Context, program: WebGLProgram, shaderInfo: Types.Shader) => {
        const shader = createShader(context, shaderInfo);
        compileShader(context, shader);
        attachShader(context, program, shader);
      };

      const createShader = (context: Types.Context, shaderInfo: Types.Shader): WebGLShader => {
        const { type, code } = shaderInfo;

        const shader = context.createShader(type!);
        if (isNil(shader)) {
          throw Error("Failed to create shader");
        }

        context.shaderSource(shader, code);

        return shader;
      };

      const compileShader = (context: Types.Context, shader: WebGLShader) => {
        context.compileShader(shader);

        const param = context.getShaderParameter(shader,context.COMPILE_STATUS);

        if (!param) {
          const log = context.getShaderInfoLog(shader);
          let msg = "Failed to compile shader";
          if (!isNil(log)) msg += ` (${log})`;
          throw Error(msg);
        }
      };

      const attachShader = (context: Types.Context, program: WebGLProgram, shader: WebGLShader) => {
        context.attachShader(program, shader);
      };

    }

    const linkProgram = (context: Types.Context, program: WebGLProgram) => {
      context.linkProgram(program);

      const param = context.getProgramParameter(program, context.LINK_STATUS);

      if (!param) {
        const log = context.getProgramInfoLog(program);
        let msg = "Failed to link program";
        if (!isNil(log)) msg += ` (${log})`;
        throw Error(msg);
      }

    };

    const useProgram = (context: Types.Context, program: WebGLProgram): Types.Variables => {

      context.useProgram(program);

      const pixelLoc = context.getUniformLocation(program, "pixel");
      if (isNil(pixelLoc)) throw Error("Failed to get uniform location of pixel");

      const onColorLoc = context.getUniformLocation(program, "onColor");
      if (isNil(onColorLoc)) throw Error("Failed to get uniform location of onColor");

      const offColorLoc = context.getUniformLocation(program, "offColor");
      if (isNil(offColorLoc)) throw Error("Failed to get uniform location of offColor");

      const positionsLoc = context.getAttribLocation(program, "position");
      if (isNil(positionsLoc)) throw Error("Failed to get attribute location of position");

      const positionsBuf = context.createBuffer();
      if (isNil(positionsBuf)) throw Error("Failed to create buffer");

      const indicesBuf = context.createBuffer();
      if (isNil(indicesBuf)) throw Error("Failed to create buffer");

      return { pixelLoc, onColorLoc, offColorLoc, positionsLoc, positionsBuf, indicesBuf };
    };

  }

  // a routine when it is being resized
  export const resize = (
    canvas: Types.Canvas, context: Types.Context,
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

  namespace Draw {

    export const main = (
      context: Types.Context,
      vars: Types.Variables,
      arrays: Types.Arrays,
      side: number
    ) => {
      clear(context);

      const onColorFloat = new Float32Array([...onColor].map(v => v/255));
      const offColorFloat = new Float32Array([...offColor].map(v => v/255));

      context.uniform1i(vars.pixelLoc, side);
      context.uniform4fv(vars.onColorLoc, onColorFloat);
      context.uniform4fv(vars.offColorLoc, offColorFloat);

      sendDataToBuffer(
        context,
        context.ARRAY_BUFFER,
        vars.positionsBuf,
        arrays.positions
      );
      activateAttribute(context, vars.positionsLoc);

      sendDataToBuffer(
        context,
        context.ELEMENT_ARRAY_BUFFER,
        vars.indicesBuf,
        arrays.indices
      );

      const vertices = 6 * (side**2);
      draw(context, vertices);
    };

    const clear = (context: Types.Context) => {
      context.clearColor(0,0,0,0);
      context.clear(context.COLOR_BUFFER_BIT);
    };

    const sendDataToBuffer = (
      context: Types.Context,
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
      context: Types.Context,
      location: GLint
    ) => {
      context.enableVertexAttribArray(location);
      context.vertexAttribPointer(
        location, 3,
        context.FLOAT,
        false,
        0, 0
      );
    };

    const draw = (
      context: Types.Context,
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

  // a routine when it is being drawn
  export const draw = Draw.main;

}

// convert state data to arrays of positions and indices
const convertData = (bits: Bits, side: number): Nullable<Types.Arrays> => {

  // In "positions", we set tuples of xy coordinates and values. We do not set dupliate values there, to reduce memory.
  // In "indices", we set indices of "positions", constituting triangles.

  if ( side === 0 ) return null;

  type Position = { x: number, y: number, value: boolean };
  type VertexIndex = {
    leftTop: number; rightTop: number;
    leftBottom: number; rightBottom: number;
  };

  const positions: Position[] = [];
  const indices: VertexIndex[] = [];

  // The index counter
  let indexCounter = 0;

  // xy coordinate to index
  const xy2i = (x: number, y: number) => x + y * side;

  // iterate over the cells
  for (let y=0;y<side;y++) for (let x=0;x<side;x++) {

    const value = bits[xy2i(x,y)];

    // the index for vertices of this cell
    const index: VertexIndex = {
      leftTop: -1, rightTop: -1,
      leftBottom: -1, rightBottom: -1
    };

    // if upper cell exists, and the value is same as upper
    // then set the positions of left top and right top vertices
    if ( y>0 && value === bits[xy2i(x,y-1)] ) {
      const indexUpper = indices[xy2i(x,y-1)];
      index.leftTop = indexUpper.leftBottom;
      index.rightTop = indexUpper.rightBottom;
    }
    else {
      positions.push({ x: x+1, y: y, value });
      index.rightTop = indexCounter;
      indexCounter++;
    }

    // if left cell exists, and the value is same as left
    // then set the positions of left top and left bottom vertices
    if ( x>0 && value === bits[xy2i(x-1,y)] ) {
      const indexLeft = indices[xy2i(x-1,y)];
      index.leftTop = indexLeft.rightTop;
      index.leftBottom = indexLeft.rightBottom;
    }
    else {
      positions.push({ x: x, y: y+1, value });
      index.leftBottom = indexCounter;
      indexCounter++;
    }

    // if both of the above conditions do not meet, set the position of left top vertex
    if (index.leftTop < 0) {
      positions.push({ x, y, value });
      index.leftTop = indexCounter;
      indexCounter++;
    }

    // set the position of right bottom vertex
    {
      positions.push({ x: x+1, y: y+1, value });
      index.rightBottom = indexCounter;
      indexCounter++;
    }

    // add the index of this cell to the indices list
    indices.push(index);

  }

  // convert arrays to the desired formats
  const positionsArray = new Float32Array(
    positions.map(
      ({ x, y, value }) => [ x, y, value ? 1 : 0 ] as number[]
    ).flat()
  );
  const indicesArray = new Int16Array(
    indices.map(
      ({ leftTop, rightTop, leftBottom, rightBottom }) => [
        // constituting two triangles
        leftTop, rightTop, leftBottom,
        rightTop, leftBottom, rightBottom
      ]
    ).flat()
  );

  return {
    positions: positionsArray,
    indices: indicesArray
  }
};

export const renderer : RendererDefs.Renderer = {
  name: glMode === "webgl2" ? "WebGL 2" : "WebGL",
  isActive: glMode !== "none",
  view: View,
  menu: Menu
};