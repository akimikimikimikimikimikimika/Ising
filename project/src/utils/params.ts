import { useState } from "react";
import { Rng, Theme } from "./types";

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
      "rng",
      "setRng",
      Rng.Crypto as Rng.Type
    ),
    ...createState(
      "theme",
      "setTheme",
      Theme.Auto as Theme.Type
    )
  }
);

export type Control = ReturnType<typeof initControl>;

export const initControl = () => (
  {
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
  }
);

export type Info = ReturnType<typeof initInfo>;

export const initInfo = () => (
  {
    ...createState(
      "passedFrames",
      "setPassedFrames",
      null as number | null
    ),
    ...createState(
      "actualInterval",
      "setActualInterval",
      null as number | null
    )
  }
);

// useState wrapper
export const createState = (
  <ValueKey extends string, SetterKey extends string, T>(
    valueKey: ValueKey,
    setterKey: SetterKey,
    initialValue: T
  ) => {
    type Output =
      { [key in ValueKey]: T } &
      { [key in SetterKey]: StateSetter<T> };

    // eslint-disable-next-line react-hooks/rules-of-hooks
    const [value, setter] = useState(initialValue);
    return { [valueKey]: value, [setterKey]: setter } as Output;
  }
);