import { renderer as webglRenderer } from "./webgl";
import { renderer as webgpuRenderer } from "./webgpu";
import {
  renderer as canvasRenderer,
  Context as CanvasContext
} from "./canvas";
import { renderer as divCssPaintingRenderer } from "./divCssPainting";
import { renderer as divBackgroundRenderer } from "./divBackground";
import { renderer as divClipPathPolygonRenderer } from "./divClipPathPolygon";
import { renderer as divShadowRenderer } from "./divShadow";
import {
  renderer as divGradientRenderer,
  Mode as DivGradientMode
} from "./divGradient";
import {
  renderer as divGridRenderer,
  Mode as DivGridMode
} from "./divGrid";
import {
  renderer as divFlexRenderer,
  Mode as DivFlexMode
} from "./divFlex";
import { renderer as divAbsoluteRenderer } from "./divAbsolute";
import {
  renderer as divInlineBlockRenderer,
  WritingMode as DivInlineBlockWritingMode,
  Direction as DivInlineBlockDirection
} from "./divInlineBlock";
import {
  renderer as divSublatticesRenderer,
  Mode as DivSublatticesMode,
  Angle as DivSublatticesAngle
} from "./divSublattices";
import {
  renderer as svgPathRenderer,
  DrawAs as SvgPathDrawAs
} from "./svgPath";
import { renderer as svgPolygonRenderer } from "./svgPolygon";
import {
  renderer as svgRectLineRenderer,
  DrawAs as SvgRectLineDrawAs
} from "./svgRectLine";
import {
  renderer as svgGradientRenderer,
  DrawAs as SvgGradientDrawAs
} from "./svgGradient";
import { RendererDefs } from "../utils/types";
import { createState } from "../utils/utils";



export const lists: RendererDefs.Renderer[] = [
  webglRenderer,
  webgpuRenderer,
  canvasRenderer,
  divCssPaintingRenderer,
  divBackgroundRenderer,
  divClipPathPolygonRenderer,
  divShadowRenderer,
  divGradientRenderer,
  divGridRenderer,
  divFlexRenderer,
  divAbsoluteRenderer,
  divInlineBlockRenderer,
  divSublatticesRenderer,
  svgPathRenderer,
  svgPolygonRenderer,
  svgRectLineRenderer,
  svgGradientRenderer,
];

export type RenderOptions = ReturnType<typeof initRenderOptions>;

export const initRenderOptions = () => (
  {
    ...createState(
      "current",
      "setCurrent",
      "" as string
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
      "divSublatticesMode",
      "setDivSublatticesMode",
      "border" as DivSublatticesMode
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