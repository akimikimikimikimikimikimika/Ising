import { useState } from "react";
import { Rng, Theme } from "./types";
import {
  Context as CanvasContext
} from "../renderers/canvas";
import {
  Mode as DivGradientMode
} from "../renderers/divGradient";
import {
  Mode as DivGridMode
} from "../renderers/divGrid";
import {
  Mode as DivFlexMode
} from "../renderers/divFlex";
import {
  WritingMode as DivInlineBlockWritingMode,
  Direction as DivInlineBlockDirection
} from "../renderers/divInlineBlock";
import {
  DrawMode as DivSublatticesDrawMode,
  RotateMode as DivSublatticeRotateMode,
  Layout as DivSublatticeLayout,
  Angle as DivSublatticesAngle
} from "../renderers/divSublattices";
import {
  DrawAs as SvgPathDrawAs
} from "../renderers/svgPath";
import {
  DrawAs as SvgRectLineDrawAs
} from "../renderers/svgRectLine";
import {
  DrawAs as SvgGradientDrawAs
} from "../renderers/svgGradient";

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
      "crypto" as Rng
    ),
    ...createState(
      "theme",
      "setTheme",
      "theme-auto" as Theme
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

export type RenderOptions = ReturnType<typeof initRenderOptions>;

export const initRenderOptions = () => (
  {
    ...createState(
      "currentRenderer",
      "setCurrentRenderer",
      null as string | null
    ),
    ...createState(
      "overlap",
      "setOverlap",
      0.1 as number
    ),
    ...createState(
      "useNthOfType",
      "setUseNthOfType",
      true as boolean
    ),
    ...createState(
      "adaptDevicePixelRatio",
      "setAdaptDevicePixelRatio",
      true as boolean
    ),
    ...createState(
      "canvasContext",
      "setCanvasContext",
      "2d" as CanvasContext
    ),
    ...createState(
      "divBackgroundMinimized",
      "setDivBackgroundMinimized",
      false as boolean
    ),
    ...createState(
      "divClipPathPolygonMinimized",
      "setDivClipPathPolygonMinimized",
      false as boolean
    ),
    ...createState(
      "divShadowMinimized",
      "setDivShadowMinimized",
      false as boolean
    ),
    ...createState(
      "divGradientMode",
      "setDivGradientMode",
      "linear-horizontal" as DivGradientMode
    ),
    ...createState(
      "divGridMode",
      "setDivGridMode",
      "vertical-horizontal" as DivGridMode
    ),
    ...createState(
      "divFlexMode",
      "setDivFlexMode",
      "vertical-horizontal" as DivFlexMode
    ),
    ...createState(
      "divAbsoluteMinimized",
      "setDivAbsoluteMinimized",
      false as boolean
    ),
    ...createState(
      "divInlineBlockWritingMode",
      "setDivInlineBlockWritingMode",
      "horizontal-tb" as DivInlineBlockWritingMode
    ),
    ...createState(
      "divInlineBlockDirection",
      "setDivInlineBlockDirection",
      "ltr" as DivInlineBlockDirection
    ),
    ...createState(
      "divSublatticesDrawMode",
      "setDivSublatticesDrawMode",
      "border" as DivSublatticesDrawMode
    ),
    ...createState(
      "divSublatticeRotateMode",
      "setDivSublatticeRotateMode",
      "per-cells" as DivSublatticeRotateMode
    ),
    ...createState(
      "divSublatticeLayout",
      "setDivSublatticeLayout",
      "layout1" as DivSublatticeLayout
    ),
    ...createState(
      "divSublatticesAngle",
      "setDivSublatticesAngle",
      "45deg" as DivSublatticesAngle
    ),
    ...createState(
      "svgPathDrawAs",
      "setSvgPathDrawAs",
      "fill" as SvgPathDrawAs
    ),
    ...createState(
      "svgPathMinimized",
      "setSvgPathMinimized",
      false as boolean
    ),
    ...createState(
      "svgPolygonMinimized",
      "setSvgPolygonMinimized",
      false as boolean
    ),
    ...createState(
      "svgRectLineDrawAs",
      "setSvgRectLineDrawAs",
      "rect-fill" as SvgRectLineDrawAs
    ),
    ...createState(
      "svgRectLineMinimized",
      "setSvgRectLineMinimized",
      false as boolean
    ),
    ...createState(
      "svgGradientDrawAs",
      "setSvgGradientDrawAs",
      "linear-horizontal" as SvgGradientDrawAs
    ),
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