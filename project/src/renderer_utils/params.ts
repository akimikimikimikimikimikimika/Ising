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
} from "../renderers/divFlow";
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
import {
  Type as InputType
} from "../renderers/input";
import { createState } from "../utils/params";

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
      0 as number
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
      "divFlexOuterReversed",
      "setDivFlexOuterReversed",
      false as boolean
    ),
    ...createState(
      "divFlexInnerReversed",
      "setDivFlexInnerReversed",
      false as boolean
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
    ...createState(
      "inputType",
      "setInputType",
      "checkbox" as InputType
    ),
    ...createState(
      "inputSize",
      "setInputSize",
      0.9 as number
    )
  }
);