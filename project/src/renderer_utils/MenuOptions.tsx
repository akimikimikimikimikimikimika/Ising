import { FC } from "react";
import { RendererOptionsFC } from "../utils/types";
import { Chooser, Range } from "../interfaces/Menu/RowItem";
import { CanvasContext, DivGradientMode, DivGridMode, DivFlexMode, DivFlowWritingMode, DivFlowDirection, DivSublatticesDrawMode, DivSublatticesRotateMode, DivSublatticesLayout, DivSublatticesAngle, SvgPathDrawAs, SvgRectLineDrawAs, SvgGradientDrawAs, InputType } from "./types";

export const CanvasMenu: RendererOptionsFC = (props) => ( <>
  <Chooser
    name="Context"
    mode="segmented"
    options={[
      { value: CanvasContext.TwoD, label: "2D" },
      { value: CanvasContext.Bitmap, label: "Bitmap Renderer" }
    ]}
    value={props.canvasContext}
    setValue={props.setCanvasContext}
  />
  <AdaptDPR {...props} />
</> );

export const DivBackgroundMenu: RendererOptionsFC = (props) => ( <>
  <Minimize
    minimize={props.divBackgroundMinimized}
    setMinimize={props.setDivBackgroundMinimized}
  />
  <Overlap {...props} />
  <AdaptDPR {...props} />
</> );

export const DivClipPathPolygonMenu: RendererOptionsFC = (props) => (
  <Minimize
    minimize={props.divClipPathPolygonMinimized}
    setMinimize={props.setDivClipPathPolygonMinimized}
  />
);

export const DivShadowMenu: RendererOptionsFC = (props) => (
  <Minimize
    minimize={props.divShadowMinimized}
    setMinimize={props.setDivShadowMinimized}
  />
);

export const DivGradientMenu: RendererOptionsFC = (props) => ( <>
  <Chooser
    name="Mode"
    mode="selector"
    options={[
      { value: DivGradientMode.LinearHorizontal, label: "Linear Gradient Horizontal" },
      { value: DivGradientMode.LinearVertical, label: "Linear Gradient Vertical" },
      { value: DivGradientMode.Conic, label: "Conic Gradient" }
    ]}
    value={props.divGradientMode}
    setValue={props.setDivGradientMode}
  />
  <Overlap {...props} />
  <AdaptDPR {...props} />
</> );

export const DivGridMenu: RendererOptionsFC = (props) => (
  <Chooser
    name="Mode"
    mode="selector"
    options={[
      { value: DivGridMode.VerticalHorizontal, label: "Row Flow" },
      { value: DivGridMode.HorizontalVertical, label: "Column Flow" },
      { value: DivGridMode.Minimized, label: "Draw One-side Cells Only" }
    ]}
    value={props.divGridMode}
    setValue={props.setDivGridMode}
  />
);

export const DivFlexMenu: RendererOptionsFC = (props) => ( <>
  <Chooser
    name="Mode"
    mode="selector"
    options={[
      { value: DivFlexMode.VerticalHorizontal, label: "Vertical → Horizontal" },
      { value: DivFlexMode.HorizontalVertical, label: "Horizontal → Vertical" }
    ]}
    value={props.divFlexMode}
    setValue={props.setDivFlexMode}
  />
  <Chooser
    name="Reverse outer"
    mode="segmented"
    options={[
      { value: false, label: "No" },
      { value: true, label: "Yes" }
    ]}
    value={props.divFlexOuterReversed}
    setValue={props.setDivFlexOuterReversed}
  />
  <Chooser
    name="Reverse inner"
    mode="segmented"
    options={[
      { value: false, label: "No" },
      { value: true, label: "Yes" }
    ]}
    value={props.divFlexInnerReversed}
    setValue={props.setDivFlexInnerReversed}
  />
</> );

export const DivAbsoluteMenu: RendererOptionsFC = (props) => ( <>
  <Minimize
    minimize={props.divAbsoluteMinimized}
    setMinimize={props.setDivAbsoluteMinimized}
  />
  <UseNthOfType {...props} />
</> );

export const DivFlowMenu: RendererOptionsFC = (props) => ( <>
  <Chooser
    name="Writing Mode"
    mode="selector"
    options={[
      { value: DivFlowWritingMode.HorizontalTB, label: "Horizontal T→B" },
      { value: DivFlowWritingMode.VerticalRL, label: "Vertical R→L" },
      { value: DivFlowWritingMode.VerticalLR, label: "Vertical L→R" }
    ]}
    value={props.divFlowWritingMode}
    setValue={props.setDivFlowWritingMode}
  />
  <Chooser
    name="Direction"
    mode="segmented"
    options={[
      { value: DivFlowDirection.LTR, label: "LTR" },
      { value: DivFlowDirection.RTL, label: "RTL" }
    ]}
    value={props.divFlowDirection}
    setValue={props.setDivFlowDirection}
  />
</> );

export const DivSublatticesMenu: RendererOptionsFC = (props) => ( <>
  <Chooser
    name="Draw as"
    mode="selector"
    options={[
      { value: DivSublatticesDrawMode.Border, label: "Border" },
      { value: DivSublatticesDrawMode.ConicGradient, label: "Conic Gradient" }
    ]}
    value={props.divSublatticesDrawMode}
    setValue={props.setDivSublatticesDrawMode}
  />
  <UseNthOfType {...props} />
  <Chooser
    name="Layout"
    mode="segmented"
    options={[
      { value: DivSublatticesLayout.One, label: "1" },
      { value: DivSublatticesLayout.Two, label: "2" }
    ]}
    value={props.divSublatticeLayout}
    setValue={props.setDivSublatticeLayout}
  />
  <Chooser
    name="Rotation angle"
    mode="segmented"
    options={[
      { value: DivSublatticesAngle.deg45, label: "45°" },
      { value: DivSublatticesAngle.deg135, label: "135°" },
      { value: DivSublatticesAngle.deg225, label: "225°" },
      { value: DivSublatticesAngle.deg315, label: "315°" }
    ]}
    value={props.divSublatticesAngle}
    setValue={props.setDivSublatticesAngle}
  />
  <Chooser
    name="Rotate"
    mode="selector"
    options={[
      { value: DivSublatticesRotateMode.PerCells, label: "per cells" },
      { value: DivSublatticesRotateMode.WholeLattice, label: "whole lattice" }
    ]}
    value={props.divSublatticeRotateMode}
    setValue={props.setDivSublatticeRotateMode}
  />
</> );

export const SvgPathMenu: RendererOptionsFC = (props) => ( <>
  <Chooser
    name="Draw as"
    mode="selector"
    options={[
      { value: SvgPathDrawAs.Fill, label: "Fill rect" },
      { value: SvgPathDrawAs.HorizontalStroke, label: "Stroke horizontal line" },
      { value: SvgPathDrawAs.VerticalStroke, label: "Stroke vertical line" }
    ]}
    value={props.svgPathDrawAs}
    setValue={props.setSvgPathDrawAs}
  />
  <Minimize
    minimize={props.svgPathMinimized}
    setMinimize={props.setSvgPathMinimized}
  />
</> );

export const SvgPolygonMenu: RendererOptionsFC = (props) => (
  <Minimize
    minimize={props.svgPolygonMinimized}
    setMinimize={props.setSvgPolygonMinimized}
  />
);

export const SvgRectLineMenu: RendererOptionsFC = (props) => ( <>
  <Chooser
    name="Draw as"
    mode="selector"
    options={[
      { value: SvgRectLineDrawAs.RectFill, label: "Rect (fill)" },
      { value: SvgRectLineDrawAs.HorizontalLineStroke, label: "Horizontal Line (stroke)" },
      { value: SvgRectLineDrawAs.VerticalLineStroke, label: "Vertical Line (stroke)" }
    ]}
    value={props.svgRectLineDrawAs}
    setValue={props.setSvgRectLineDrawAs}
  />
  <Minimize
    minimize={props.svgRectLineMinimized}
    setMinimize={props.setSvgRectLineMinimized}
  />
  <Overlap {...props} />
</> );

export const SvgGradientMenu: RendererOptionsFC = (props) => ( <>
  <Chooser
    name="Draw as"
    mode="selector"
    options={[
      { value: SvgGradientDrawAs.HorizontalLineStroke, label: "Horizontal Linear Gradient" },
      { value: SvgGradientDrawAs.VerticalLineStroke, label: "Vertical Linear Gradient" }
    ]}
    value={props.svgGradientDrawAs}
    setValue={props.setSvgGradientDrawAs}
  />
  <Range
    name="Overlap"
    min={0} max={1} step={0.1}
    value={props.overlap} setValue={props.setOverlap}
  />
</> );

export const InputMenu: RendererOptionsFC = (props) => ( <>
  <Chooser
    name="Type"
    mode="selector"
    options={[
      { value: InputType.Checkbox, label: "Checkbox" },
      { value: InputType.Radio, label: "Radio Button" }
    ]}
    value={props.inputType}
    setValue={props.setInputType}
  />
  <Range
    name="Size"
    min={0.5} max={1} step={0.05}
    value={props.inputSize} setValue={props.setInputSize}
  />
</> );

type OverlapProps = {
  overlap: number;
  setOverlap: StateSetter<number>;
};

const Overlap: FC<OverlapProps> = (props) => (
  <Range
    name="Overlap"
    min={0} max={1} step={0.1}
    value={props.overlap} setValue={props.setOverlap}
  />
);

type AdaptDPRProps = {
  adaptDevicePixelRatio: boolean;
  setAdaptDevicePixelRatio: StateSetter<boolean>;
};

export const AdaptDPR: FC<AdaptDPRProps> = (props) => (
  <Chooser
    name="Device Pixel Ratio"
    mode="segmented"
    options={[
      { value: true, label: "Adapt" },
      { value: false, label: "Ignore" }
    ]}
    value={props.adaptDevicePixelRatio}
    setValue={props.setAdaptDevicePixelRatio}
  />
);

type UseNthOfTypeProps = {
  useNthOfType: boolean;
  setUseNthOfType: StateSetter<boolean>;
};

export const UseNthOfType: FC<UseNthOfTypeProps> = (props) => (
  <Chooser
    name="use nth-of-type"
    mode="segmented"
    options={[
      { value: true, label: "Yes" },
      { value: false, label: "No" }
    ]}
    value={props.useNthOfType}
    setValue={props.setUseNthOfType}
  />
);

type MinimizeProps = {
  minimize: boolean;
  setMinimize: StateSetter<boolean>;
};

const Minimize: FC<MinimizeProps> = (props) => (
  <Chooser
    name="Draw"
    mode="selector"
    options={[
      { value: false, label: "All Cells" },
      { value: true, label: "One-side Cells Only" }
    ]}
    value={props.minimize}
    setValue={props.setMinimize}
  />
);
