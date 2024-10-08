/* eslint-disable @typescript-eslint/no-namespace */
import { Rng, Bits, Orders, XY } from "./types";
import { Parameters } from "./params";

// a wrapper of the random number generators
namespace Random {

  const size = 256;

  let arr: Nullable<Uint32Array> = null;
  let position: number = 0;

  // a cryptographically secure random number generator
  const cryptoRng = ():number => {
    if (isNil(arr)) {
      arr = new Uint32Array(size);
      crypto.getRandomValues( arr );
    }

    if ( position >= size ) {
      crypto.getRandomValues( arr );
      position = 0;
    }

    const real = arr[position] / 4294967295;
    position++;
    return real;
  };

  // wrapper of random number generators
  export const random = (rng: Rng.Type): number => {
    switch (rng) {
      case Rng.Normal: return Math.random();
      case Rng.Crypto: return cryptoRng();
    }
  };

}
const random = Random.random;

// the state calculation mechanism
export namespace Calc {

  // calculate the new state
  export const next = (
    bits: Bits,
    params: Parameters
  ): Bits => {

    // unpack & process parameters
    const T = Math.exp(params.temp) * unitTemp;
    const H = params.magField;
    const J = params.interaction;
    const side = params.pixels;
    const rng = params.rng;

    // create the order to evalute
    const orders: Orders = [];
    const size = side ** 2;
    for (let idx=0;idx<size;idx++) {
      const pos = Math.floor(random(rng)*(idx+1));
      orders.splice(pos,0,idx);
    }

    // get the array index from the given x, y coordinate
    const flatten = (x: number, y: number) => {
      const offsetX = ( x + side ) % side;
      const offsetY = ( y + side ) % side;
      return offsetX + offsetY * side;
    };

    // set the next value of each bit
    // the bits are chosen with the given order list
    for (const order of orders) {

      // get the x, y coordinate
      const { x, y } = indexToXY(order, side);

      // calculate the exponent of boltzmann factor
      const bf =
      neighbors.map(
        ([nx,ny]) => {
          const bit = bits[ flatten(x+nx,y+ny) ] ? +1 : -1;
          return J * bit;
        }
      ).reduce( (p,c) => p+c, H );

      // calculate the probability of up bit
      const probab = 1 / ( 1 + Math.exp( -2 * bf / T ) );

      // determine the new bit sign
      const newBit = random(rng) < probab;

      // assign the new bit
      bits[order] = newBit;

    }

    return [...bits];

  };

  // diff coordinate for neighbor cells
  const neighbors: Array<[number, number]> = [[-1,0],[+1,0],[0,-1],[0,+1]];

  // temperature unit
  // calculated from Kramers-Wannier duality
  const unitTemp = 2 / Math.log( 1 + Math.SQRT2 );

  // update bits and orders when the new pixel size is applied
  export const sideUpdate = (
    oldBits: Bits,
    params: Parameters
  ): Bits => {

    const newSide = params.pixels;
    const oldSide = oldBits.length>0 ? Math.round(oldBits.length**0.5) : 0;
    const rng = params.rng;

    // when the pixel size is not changed
    if (oldSide === newSide) return oldBits;

    const bits: Bits = [];

    // when the initial pixel size is zero
    if (oldSide == 0) {
      const size = newSide ** 2;
      for (let idx=0; idx<size; idx++) {
        bits.push( random(rng) >= 0.5 );
      }
      return bits;
    }
    else {

      // when the pixel size is increasing
      if (oldSide < newSide) {
        // using linear approximation of nearest neighbors
        for (let y=0; y<newSide; y++) for (let x=0; x<newSide; x++) {
          // relative position in old lattice
          const x_rel = x * (oldSide-1) / (newSide-1);
          const y_rel = y * (oldSide-1) / (newSide-1);

          // calculate the numerator and denominator of the new value
          const [num,den] =
          [0b00,0b01,0b10,0b11].map((bitFlag) => {

            // coordinate of nearest neighbor cell in old lattice
            const x_nn = bitFlag&0b01 ? Math.floor(x_rel) : Math.ceil(x_rel);
            const y_nn = bitFlag&0b10 ? Math.floor(y_rel) : Math.ceil(y_rel);

            // value of old lattice
            const val = oldBits[ x_nn + y_nn * oldSide ] ? 1 : 0;

            // weight
            const wx = 1 - Math.abs( x_nn - x_rel );
            const wy = 1 - Math.abs( y_nn - y_rel );
            const w = wx * wy;

            // returns [numerator, denominator]
            return [ w * val, w ] as [number, number];
          }).reduce(
            ([num1,den1],[num2,den2]) => [num1+num2,den1+den2],
            [0,0]
          );

          // create the value and add it to the new array
          bits.push( (num/den) >= 0.5 );
        }
      }

      // when the pixel size is decreasing
      if (oldSide > newSide) {

        // first, for each cell in new lattice, make list of affecting cell in old lattice (in 1-dim)
        const affectingCells: number[][] = [];
        for (let idx=0; idx<newSide; idx++) affectingCells.push([]);
        for (let idx=0; idx<oldSide; idx++) {
          const ratio = idx * (newSide-1)/(oldSide-1);
          const f = Math.floor(ratio);
          const c = Math.ceil(ratio);
          if (f===c) affectingCells[ratio].push(idx);
          else {
            affectingCells[f].push(idx);
            affectingCells[c].push(idx);
          }
        }

        // using linear approximation of nearest neighbors
        for (let y=0; y<newSide; y++) for (let x=0; x<newSide; x++) {
          // get affecting cells for x,y axis, respectively
          const x_acl = affectingCells[x];
          const y_acl = affectingCells[y];

          // make cartesian product of coordinates
          const ac =
          x_acl.map((xi) => {
            return y_acl.map((yi) => {
              return [xi,yi] as [number,number];
            });
          }).reduce(
            (cum,current) => cum.concat(current), []
          );

          // calculate the numerator and denominator of the new value
          const [num,den] =
          ac.map(([xi,yi]) => {

            // value of old lattice
            const val = oldBits[ xi + yi * oldSide ] ? 1 : 0;

            // weight
            const wx = 1 - Math.abs( x - xi * (newSide-1) / (oldSide-1) );
            const wy = 1 - Math.abs( y - yi * (newSide-1) / (oldSide-1) );
            const w = wx * wy;

            // returns [numerator, denominator]
            return [ w * val, w ] as [number, number];
          }).reduce(
            ([num1,den1],[num2,den2]) => [num1+num2,den1+den2],
            [0,0]
          );

          // create the value and add it to the new array
          bits.push( num/den >= 0.5 );
        }

      }

    }

    return bits;
  };

}

// the manager to proceed states with the given interval
export namespace Runner {

  // event timer manager type
  // The given action function is called in the given interval seconds
  export type Runner = {

    // called function
    // The manager does not run if it is set to null
    action: Nullable< () => void >;
    // start or resume timer
    play: () => void;
    // stop timer immediately
    pause: () => void;

    // minimum time interval (in milliseconds) between calls
    interval: number;

    // statistical information

    // number of animation frames passed before the frame calling the action
    passedFrames: number | null;

    // the actual time interval (in millsecs) between calls of the action
    actualInterval: number | null;

  }

  // create a new runner
  export const makeRunner = (): Runner => {
    let intId: Nullable<number> = null;
    let lastDate: Nullable<number> = null;
    let frameCounter: number = 0;

    const animationFrame = (date: DOMHighResTimeStamp) => {

      if (!isNil(lastDate)) {
        const duration = date - lastDate;
        frameCounter++;
        if (duration >= runner.interval) {
          runner.actualInterval = duration;
          runner.passedFrames = frameCounter;
          frameCounter = 0;
          lastDate = date;
          runner.action?.();
        }
      }
      else {
        lastDate = date;
        frameCounter = 0;
      }

      intId = window.requestAnimationFrame(animationFrame);
    };

    const runner: Runner = {
      action: null,
      play: () => {
        if (isNil(intId)) animationFrame(performance.now());
      },
      pause: () => {
        if (!isNil(intId)) {
          window.cancelAnimationFrame(intId);
          intId = null;
          lastDate = null;
          runner.passedFrames = null;
          runner.actualInterval = null;
        }
      },
      interval: 1000,
      passedFrames: 0,
      actualInterval: 0
    };

    return runner;
  };

  // sleep in the given seconds
  export const sleep = async (sec: number) => {
    const promise = new Promise<void>((resolve) => {
      setTimeout(() => resolve(undefined), sec*1000);
    });
    await promise;
  };

}

// utilities to handle array of the states
export namespace ArrayUtils {

  // utilities of reordering bits array
  namespace Reorder {

    // the type of a function showing array transforming strategy
    export type Process = (arg: { x: number, y: number, side: number }) => ({ x: number, y: number });

    // predefined processors
    export const processors = {
      flipX: ( ({ x, y, side }) => ({ x: side - 1 - x, y }) ) as Process,
      flipY: ( ({ x, y, side }) => ({ x, y: side - 1 - y }) ) as Process,
      transpose: ( ({ x, y }) => ({ x: y, y: x }) ) as Process,
      identity: ( ({ x, y }) => ({ x, y }) ) as Process
    };

    // create a processor by multiplying existing processors
    export const multiplyProcess = (...processes: Process[]): Process => (
      ({ x: inputX, y: inputY, side }) => {
        let [x,y] = [inputX,inputY];
        for (const p of processes) {
          const { x: tx, y: ty } = p({ x, y, side });
          x = tx; y = ty;
        }
        return { x, y };
      }
    );

    // reordering bits with the given strategy function
    export const performProcess = (bits: Bits, process: Process): Bits => {
      const side = Math.round(Math.sqrt(bits.length));
      return Array.from({ length: bits.length },(_,idx) => {
        const inputXY = indexToXY(idx, side);
        const { x, y } = process({ ...inputXY, side });
        return bits[ x + y * side ];
      });
    };

    // transpose x-axis and y-axis of bits
    export const transpose =
      (bits: Bits): Bits => performProcess(bits, processors.transpose);

  }
  export type Process = Reorder.Process;
  export const processors = Reorder.processors;
  export const multiplyProcess = Reorder.multiplyProcess;
  export const performProcess = Reorder.performProcess;
  export const transpose = Reorder.transpose;

  // create the nested array from the given 1-dim array
  export const nested = <T,>(arr1d: T[]): T[][] => {
    const side = Math.round(Math.sqrt(arr1d.length));
    return Array.from({ length: side }, (_,idx) => arr1d.slice(idx*side,(idx+1)*side));
  };

  // the utility of get the majority state and the position of minorities
  // This is used in renderers with the minimized option
  namespace Minimize {

    type Cell = XY;

    type Minimize = (
      ( (bits: Bits, side: number, includeMajor?: false) => {
        majority: boolean;
        minors: Cell[];
      } ) &
      ( (bits: Bits, side: number, includeMajor: true) => {
        majority: boolean;
        minors: Cell[];
        majors: Cell[];
      } )
    );

    export const minimize = ((bits: Bits, side: number, includeMajor: boolean = false) => {

      const majority = getMajority(bits);

      const tuples =
        bits.map((value,idx) => {
          const { x, y } = indexToXY(idx, side);
          return [ value, x, y ] as [ boolean, number, number ];
        });

      const minors =
        tuples
        .filter(([value,,]) => value!==majority)
        .map(([,x,y]) => ({ x, y }));

      if (!(includeMajor ?? false))
        return { majority, minors };

      const majors =
        tuples
        .filter(([value,,]) => value===majority)
        .map(([,x,y]) => ({ x, y }));

      return { majority, majors, minors };
    }) as Minimize;

    export const getMajority = (bits: Bits): boolean => {
      const halfSize = bits.length / 2;
      let on = 0; let off = 0;
      for (const bit of bits) {
        if (bit) on++;
        else off++;
        if (on > halfSize) return true;
        if (off > halfSize) return false;
      }
      return Math.random() > 0.5;
    };

  }
  export const minimize = Minimize.minimize;

  // the utility of get coordinates to draw states as polygons
  // This is used in renderers with polygon drawing
  namespace Polygon {

    type Point = XY;

    type GetPolygonPoints = (
      ( (bits: Bits, side: number, minimize: false ) => { on: Point[], off: Point[] } ) &
      ( (bits: Bits, side: number, minimize: true ) => { points: Point[], majority: boolean } )
    );

    export const getPolygonPoints = ((bits: Bits, side: number, minimize: boolean ) => {

      if (!minimize) {
        const onPoints: Point[] = [];
        const offPoints: Point[] = [];

        for (let y=0;y<side;y++) {
          onPoints.push({ x: 0, y });
          offPoints.push({ x: 0, y });
          for (let x=0;x<side;x++) {
            const value = bits[ x + y * side ];
            ( value ? onPoints : offPoints ).push(
              { x, y }, { x: x+1, y }, { x: x+1, y: y+1 }, { x, y: y+1 }, { x, y }
            );
          }
          onPoints.push({ x: 0, y });
          offPoints.push({ x: 0, y });
        }

        return { on: onPoints, off: offPoints };
      }

      else {
        const points: Point[] = [];
        const majority = Minimize.getMajority(bits);

        for (let y=0;y<side;y++) {
          points.push({ x: 0, y });
          for (let x=0;x<side;x++) {
            const value = bits[ x + y * side ];
            if ( value === majority ) continue;
            points.push(
              { x, y }, { x: x+1, y }, { x: x+1, y: y+1 }, { x, y: y+1 }, { x, y }
            );
          }
          points.push({ x: 0, y });
        }

        return { points, majority };
      }
    }) as GetPolygonPoints;

  }
  export const getPolygonPoints = Polygon.getPolygonPoints;

  // the utility of get the stop info (position, state) of a linear gradient
  // This is used in renderers that represent rows as linear gradients
  namespace StopInfo {

    type Stop = { begin: number; end: number; value: boolean; };

    // generate color stops information from bits
    export const makeStops = (bits: Bits): Stop[] => {
      const stops: Stop[] = [];

      bits.forEach((value, idx) => {
        if (idx===0) stops.push({ begin: 0, end: 1, value });
        else {
          const lastStop = stops[stops.length-1];
          if (lastStop.value===value) lastStop.end = idx + 1;
          else stops.push({ begin: idx, end: idx + 1, value });
        }
      });

      return stops;
    };

  }
  export const makeStops = StopInfo.makeStops;

  // the utility of get the vertices info (position, state) and indices
  // This is used in WebGL and WebGPU
  namespace Vertices {

    export type Arrays = {
      // x,y coordinates of vertices
      // the normalization are conducted in the shader
      positions: number[];
      // values of vertices (0 or 1)
      values: boolean[];
      // We do not set dupliate values to positions and values to reduce memory.
      // Instead, we use indices array to declare the order of the vertices.
      indices: number[];
    };

    // convert state data to arrays of positions, colors, and indices
    export const get = (bits: Bits, side: number): Nullable<Arrays> => {

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
      const positionsArray = positions.map(
        ({ x, y }) => [ x, y ] as number[]
      ).flat();
      const valuesArray = positions.map(
        ({ value }) => value
      );
      const indicesArray = indices.map(
        ({ leftTop, rightTop, leftBottom, rightBottom }) => [
          // constituting two triangles
          leftTop, rightTop, leftBottom,
          rightTop, leftBottom, rightBottom
        ]
      ).flat();

      return {
        positions: positionsArray,
        values: valuesArray,
        indices: indicesArray
      };
    };

  }
  export type VerticesArrays = Vertices.Arrays;
  export const getVertices = Vertices.get;

}

export const indexToXY = (index: number, side: number): XY => (
  { x: index % side, y: Math.floor( index / side ) }
);

export const cssSupports = (...args: [string, string][] ): boolean => {
  for (const [prop,value] of args) {
    if (!CSS.supports(prop,value)) return false;
  }
  return true;
};

export const minifyCss = (src: string) => src.replace(/^ +/gm,"").replace(/\n/g,"");

export type Nil = undefined | null;
export const isNil = (value: unknown): value is Nil => value == null;
