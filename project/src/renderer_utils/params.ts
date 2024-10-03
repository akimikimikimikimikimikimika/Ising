import { CanvasContext, DivGradientMode, DivGridMode, DivFlexMode, DivFlowWritingMode, DivFlowDirection, DivSublatticesDrawMode, DivSublatticesRotateMode, DivSublatticesLayout, DivSublatticesAngle, SvgPathDrawAs, SvgRectLineDrawAs, SvgGradientDrawAs, InputType } from "./types";
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
      CanvasContext.TwoD as CanvasContext.Type
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
      DivGradientMode.LinearHorizontal as DivGradientMode.Type
    ),
    ...createState(
      "divGridMode",
      "setDivGridMode",
      DivGridMode.VerticalHorizontal as DivGridMode.Type
    ),
    ...createState(
      "divFlexMode",
      "setDivFlexMode",
      DivFlexMode.VerticalHorizontal as DivFlexMode.Type
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
      "divFlowWritingMode",
      "setDivFlowWritingMode",
      "horizontal-tb" as DivFlowWritingMode.Type
    ),
    ...createState(
      "divFlowDirection",
      "setDivFlowDirection",
      "ltr" as DivFlowDirection.Type
    ),
    ...createState(
      "divSublatticesDrawMode",
      "setDivSublatticesDrawMode",
      DivSublatticesDrawMode.Border as DivSublatticesDrawMode.Type
    ),
    ...createState(
      "divSublatticeRotateMode",
      "setDivSublatticeRotateMode",
      DivSublatticesRotateMode.PerCells as DivSublatticesRotateMode.Type
    ),
    ...createState(
      "divSublatticeLayout",
      "setDivSublatticeLayout",
      DivSublatticesLayout.One as DivSublatticesLayout.Type
    ),
    ...createState(
      "divSublatticesAngle",
      "setDivSublatticesAngle",
      DivSublatticesAngle.deg45 as DivSublatticesAngle.Type
    ),
    ...createState(
      "svgPathDrawAs",
      "setSvgPathDrawAs",
      SvgPathDrawAs.Fill as SvgPathDrawAs.Type
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
      SvgRectLineDrawAs.RectFill as SvgRectLineDrawAs.Type
    ),
    ...createState(
      "svgRectLineMinimized",
      "setSvgRectLineMinimized",
      false as boolean
    ),
    ...createState(
      "svgGradientDrawAs",
      "setSvgGradientDrawAs",
      SvgGradientDrawAs.HorizontalLineStroke as SvgGradientDrawAs.Type
    ),
    ...createState(
      "inputType",
      "setInputType",
      InputType.Checkbox as InputType.Type
    ),
    ...createState(
      "inputSize",
      "setInputSize",
      0.9 as number
    )
  }
);