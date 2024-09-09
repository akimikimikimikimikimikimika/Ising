/* eslint-disable @typescript-eslint/no-namespace */
import { RenderOptions } from "../renderers/list";

export type Rng = "normal" | "crypto";

export type Parameters = {
  temp: number;
  setTemp: StateSetter<number>;
  magField: number;
  setMagField: StateSetter<number>;
  interaction: number;
  setInteraction: StateSetter<number>;
  pixels: number;
  setPixels: StateSetter<number>;
  playing: boolean;
  setPlaying: StateSetter<boolean>;
  rng: Rng;
  setRng: StateSetter<Rng>;
};

export type Bits = boolean[];
export type Orders = number[];

import { FC } from "react";
export namespace RendererDefs {

  export type Renderer = {
    name: string;
    willInstall: boolean;
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