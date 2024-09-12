/* eslint-disable react-hooks/rules-of-hooks */
import { useState } from "react";
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



export type RenderOptions = {
  current: string;
  setCurrent: StateSetter<string>;
  // the magnitude of overlap of cells
  // 0 for not overlap, 1 for completely overlap
  overlap: number;
  setOverlap: StateSetter<number>;
  // whether the image should be adapted to the device pixel ratio
  adaptDevicePixelRatio: boolean;
  setAdaptDevicePixelRatio: StateSetter<boolean>;
  canvasContext: CanvasContext;
  setCanvasContext: StateSetter<CanvasContext>;
  divBackgroundMinimized: boolean;
  setDivBackgroundMinimized: StateSetter<boolean>;
  divClipPathPolygonMinimized: boolean;
  setDivClipPathPolygonMinimized: StateSetter<boolean>;
  divShadowMinimized: boolean;
  setDivShadowMinimized: StateSetter<boolean>;
  divGradientMode: DivGradientMode;
  setDivGradientMode: StateSetter<DivGradientMode>;
  divGridMode: DivGridMode;
  setDivGridMode: StateSetter<DivGridMode>;
  divFlexMode: DivFlexMode;
  setDivFlexMode: StateSetter<DivFlexMode>;
  divAbsoluteMinimized: boolean;
  setDivAbsoluteMinimized: StateSetter<boolean>;
  divInlineBlockWritingMode: DivInlineBlockWritingMode;
  setDivInlineBlockWritingMode: StateSetter<DivInlineBlockWritingMode>;
  divInlineBlockDirection: DivInlineBlockDirection;
  setDivInlineBlockDirection: StateSetter<DivInlineBlockDirection>;
  divSublatticesMode: DivSublatticesMode;
  setDivSublatticesMode: StateSetter<DivSublatticesMode>;
  divSublatticesAngle: DivSublatticesAngle;
  setDivSublatticesAngle: StateSetter<DivSublatticesAngle>;
  svgPathDrawAs: SvgPathDrawAs;
  setSvgPathDrawAs: StateSetter<SvgPathDrawAs>;
  svgPathMinimized: boolean;
  setSvgPathMinimized: StateSetter<boolean>;
  svgPolygonMinimized: boolean;
  setSvgPolygonMinimized: StateSetter<boolean>;
  svgRectLineDrawAs: SvgRectLineDrawAs;
  setSvgRectLineDrawAs: StateSetter<SvgRectLineDrawAs>;
  svgRectLineMinimized: boolean;
  setSvgRectLineMinimized: StateSetter<boolean>;
  svgGradientDrawAs: SvgGradientDrawAs;
  setSvgGradientDrawAs: StateSetter<SvgGradientDrawAs>;
};

export const makeRenderOptions = (): RenderOptions => {
  const [current, setCurrent] = useState<string>("");
  const [overlap, setOverlap] = useState<number>(0.1);
  const [adaptDevicePixelRatio, setAdaptDevicePixelRatio] = useState<boolean>(true);
  const [canvasContext, setCanvasContext] = useState<CanvasContext>("2d");
  const [divBackgroundMinimized, setDivBackgroundMinimized] = useState<boolean>(false);
  const [divClipPathPolygonMinimized, setDivClipPathPolygonMinimized] = useState<boolean>(false);
  const [divShadowMinimized, setDivShadowMinimized] = useState<boolean>(false);
  const [divGradientMode, setDivGradientMode] = useState<DivGradientMode>("linear-horizontal");
  const [divGridMode, setDivGridMode] = useState<DivGridMode>("vertical-horizontal");
  const [divFlexMode, setDivFlexMode] = useState<DivFlexMode>("vertical-horizontal");
  const [divAbsoluteMinimized, setDivAbsoluteMinimized] = useState<boolean>(false);
  const [divInlineBlockWritingMode, setDivInlineBlockWritingMode] = useState<DivInlineBlockWritingMode>("horizontal-tb");
  const [divInlineBlockDirection, setDivInlineBlockDirection] = useState<DivInlineBlockDirection>("ltr");
  const [divSublatticesMode, setDivSublatticesMode] = useState<DivSublatticesMode>("border");
  const [divSublatticesAngle, setDivSublatticesAngle] = useState<DivSublatticesAngle>("45deg");
  const [svgPathDrawAs, setSvgPathDrawAs] = useState<SvgPathDrawAs>("fill");
  const [svgPathMinimized, setSvgPathMinimized] = useState<boolean>(false);
  const [svgPolygonMinimized, setSvgPolygonMinimized] = useState<boolean>(false);
  const [svgRectLineDrawAs, setSvgRectLineDrawAs] = useState<SvgRectLineDrawAs>("rect-fill");
  const [svgRectLineMinimized, setSvgRectLineMinimized] = useState<boolean>(false);
  const [svgGradientDrawAs, setSvgGradientDrawAs] = useState<SvgGradientDrawAs>("linear-horizontal");

  return {
    current, setCurrent,
    overlap, setOverlap,
    adaptDevicePixelRatio, setAdaptDevicePixelRatio,
    canvasContext, setCanvasContext,
    divBackgroundMinimized, setDivBackgroundMinimized,
    divClipPathPolygonMinimized, setDivClipPathPolygonMinimized,
    divShadowMinimized, setDivShadowMinimized,
    divGradientMode, setDivGradientMode,
    divGridMode, setDivGridMode,
    divFlexMode, setDivFlexMode,
    divAbsoluteMinimized, setDivAbsoluteMinimized,
    divInlineBlockWritingMode, setDivInlineBlockWritingMode,
    divInlineBlockDirection, setDivInlineBlockDirection,
    divSublatticesMode, setDivSublatticesMode,
    divSublatticesAngle, setDivSublatticesAngle,
    svgPathDrawAs, setSvgPathDrawAs,
    svgPathMinimized, setSvgPathMinimized,
    svgPolygonMinimized, setSvgPolygonMinimized,
    svgRectLineDrawAs, setSvgRectLineDrawAs,
    svgRectLineMinimized, setSvgRectLineMinimized,
    svgGradientDrawAs, setSvgGradientDrawAs,
  };
};