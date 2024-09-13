/* eslint-disable @typescript-eslint/no-namespace */
import { FC } from "react";
import { RenderOptions } from "../renderers/list";
import { createState } from "../utils/utils";

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

export type Parameters = ReturnType<typeof initParams>;

export const initParams = () => (
  {
    ...createState(
      "temp",
      "setTemp",
      1 as number
    ),
    ...createState(
      "magField",
      "setMagField",
      0 as number
    ),
    ...createState(
      "interaction",
      "setInteraction",
      1 as number
    ),
    ...createState(
      "pixels",
      "setPixels",
      50 as number
    ),
    ...createState(
      "interval",
      "setInterval",
      100 as number
    ),
    ...createState(
      "playing",
      "setPlaying",
      false as boolean
    ),
    ...createState(
      "rng",
      "setRng",
      "crypto" as Rng
    ),
    ...createState(
      "theme",
      "setTheme",
      "theme-auto" as Theme
    )
  }
);

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