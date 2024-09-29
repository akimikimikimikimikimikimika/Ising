/* eslint-disable @typescript-eslint/no-namespace */
import { FC } from "react";
import { RenderOptions } from "../renderer_utils/params";

export const RngConsts = {
  Normal: "normal",
  Crypto: "crypto"
} as const;
export type Rng = Literal<typeof RngConsts>;

export const ThemeConsts = {
  Light: "theme-light",
  Dark: "theme-dark",
  Auto: "theme-auto"
} as const;
export type Theme = Literal<typeof ThemeConsts>;

export type Bits = boolean[];
export type Orders = number[];

export namespace RendererDefs {

  export type Renderer = {
    name: string;
    isActive: boolean;
    view: FC<RendererProps>;
    menu?: FC<RenderOptions>;
  };

  export type WH = { width: number, height: number };

  export type RendererProps = {
    renderer: Renderer;
    bits: Bits;
    side: number;
    windowSize: WH;
    notifyFailure: (message?:string) => void;
  } & RenderOptions;

}