/* eslint-disable @typescript-eslint/no-namespace */
import { Rng, Bits, Orders, Parameters } from "./types";
import { isNil } from "./type_check";

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
  export const random = (rng:Rng): number => {
    switch (rng) {
      case "normal": return Math.random();
      case "crypto": return cryptoRng();
    }
  };

}
const random = Random.random;

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
    const flatten = (x: number, y: number) => x + y * side;

    // set the next value of each bit
    // the bits are chosen with the given order list
    for (const order of orders) {

      // get the x, y coordinate
      const x = order % side;
      const y = Math.floor( order / side );

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
  const neighbors: Array<[number,number]> = [[-1,0],[+1,0],[0,-1],[0,+1]];

  // temperature unit
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
    if (oldSide===newSide) return oldBits;

    const bits: Bits = [];

    // when the initial pixel size is zero
    if (oldSide==0) {
      const size = newSide ** 2;
      for (let idx=0;idx<size;idx++) {
        bits.push( random(rng) >= 0.5 );
      }
      return bits;
    }
    else {

      // when the pixel size is increasing
      if (oldSide<newSide) {
        // using linear approximation of nearest neighbors
        for (let y=0;y<newSide;y++) for (let x=0;x<newSide;x++) {
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
      if (oldSide>newSide) {

        // first, for each cell in new lattice, make list of affecting cell in old lattice (in 1-dim)
        const affectingCells: number[][] = [];
        for (let idx=0;idx<newSide;idx++) affectingCells.push([]);
        for (let idx=0;idx<oldSide;idx++) {
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
        for (let y=0;y<newSide;y++) for (let x=0;x<newSide;x++) {
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

    // time interval (in milliseconds) between calls
    interval: number;

    // users should not use directly below properties or method
    intId: Nullable<number>;
    lastDate: Nullable<Date>;
    animationFrame: () => void;

  }

  // create a new runner
  export const makeRunner = (): Runner => {
    return {
      action: null,
      play: function() {
        if (isNil(this.intId)) this.animationFrame();
      },
      pause: function() {
        if (!isNil(this.intId)) {
          window.cancelAnimationFrame(this.intId);
        }
        this.intId = null;
      },
      interval: 1000,
      intId: null, lastDate: null,
      animationFrame: function() {
        const date = new Date();
        if (!isNil(this.lastDate)) {
          const duration = Number(date) - Number(this.lastDate);
          if (duration >= this.interval) {
            this.lastDate = date;
            if (!isNil(this.action)) this.action();
          }
        }
        else this.lastDate = date;
        this.intId = window.requestAnimationFrame(() => this.animationFrame());
      }
    };
  };

  // sleep in the given seconds
  export const sleep = async (sec:number) => {
    const promise = new Promise<void>((resolve) => {
      setTimeout(() => resolve(undefined), sec*1000);
    });
    await promise;
  };

}

export namespace ArrayUtils {

  export type Process = (arg: { x: number, y: number, side: number }) => ({ x: number, y: number });

  export const processors = {
    flipX: ( ({ x, y, side }) => ({ x: side - 1 - x, y }) ) as Process,
    flipY: ( ({ x, y, side }) => ({ x, y: side - 1 - y }) ) as Process,
    transpose: ( ({ x, y }) => ({ x: y, y: x }) ) as Process,
    identity: ( ({ x, y }) => ({ x, y }) ) as Process
  };

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

  export const performProcess = (bits: Bits, process: Process): Bits => {
    const side = Math.round(Math.sqrt(bits.length));
    return Array.from({ length: bits.length },(_,idx) => {
      const inputX = idx % side;
      const inputY = Math.floor( idx / side );
      const { x, y } = process({ x: inputX, y: inputY, side });
      return bits[ x + y * side ];
    });
  };

  export const transpose =
    (bits: Bits): Bits => performProcess(bits, processors.transpose);

  export const nested = <T,>(arr1d: T[]): T[][] => {
    const side = Math.round(Math.sqrt(arr1d.length));
    return Array.from({ length: side }, (_,idx) => arr1d.slice(idx*side,(idx+1)*side));
  };

  namespace Minimize {

    type Cell = { x: number, y: number };

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
          const x = idx % side;
          const y = Math.floor( idx / side );
          return [value,x,y] as [boolean,number,number];
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

  namespace Polygon {

    type Point = { x: number, y: number };

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

}

export const cssSupports = (...args: [string, string][] ): boolean => {
  for (const [prop,value] of args) {
    if (!CSS.supports(prop,value)) return false;
  }
  return true;
};

export const minifyCss = (src: string) => src.replace(/^ +/gm,"").replace(/\n/g,"");