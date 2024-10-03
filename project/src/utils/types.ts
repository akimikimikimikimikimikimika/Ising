/* eslint-disable @typescript-eslint/no-namespace */
import { FC } from "react";
import { RenderOptions } from "../renderer_utils/params";

export namespace Rng {
  export const Normal = "normal";
  export const Crypto = "crypto";

  type Rng = typeof Normal | typeof Crypto;
  export type Type = Rng;
}

export namespace Theme {
  export const Light = "theme-light";
  export const Dark = "theme-dark";
  export const Auto = "theme-auto";

  type Theme = typeof Light | typeof Dark | typeof Auto;
  export type Type = Theme;
}

export type Bits = boolean[];
export type Orders = number[];

export type Renderer = {
  name: string;
  isActive: boolean;
  view: RendererFC;
  menu?: RendererOptionsFC;
};

export type XY = { x: number; y: number; };
export type WH = { width: number, height: number };

export type RendererProps = {
  renderer: Renderer;
  bits: Bits;
  side: number;
  windowSize: WH;
  notifyFailure: (message?:string) => void;
} & RenderOptions;

export type RendererFC = FC<RendererProps>;
export type RendererOptionsFC = FC<RenderOptions>;