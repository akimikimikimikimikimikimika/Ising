import { FC } from "react";
import { Chooser, Range } from "../interfaces/Menu/RowItem";
import { RenderOptions } from "../utils/params";

export const CanvasMenu: FC<RenderOptions> = (props) => ( <>
  <Chooser
    name="Context"
    mode="segmented"
    options={[
      { value: "2d", label: "2D" },
      { value: "bitmaprenderer", label: "Bitmap Renderer" }
    ]}
    value={props.canvasContext}
    setValue={props.setCanvasContext}
  />
  <AdaptDPR {...props} />
</> );

export const DivBackgroundMenu: FC<RenderOptions> = (props) => ( <>
  <Minimize
    minimize={props.divBackgroundMinimized}
    setMinimize={props.setDivBackgroundMinimized}
  />
  <Overlap {...props} />
  <AdaptDPR {...props} />
</> );

export const DivClipPathPolygonMenu: FC<RenderOptions> = (props) => (
  <Minimize
    minimize={props.divClipPathPolygonMinimized}
    setMinimize={props.setDivClipPathPolygonMinimized}
  />
);

export const DivShadowMenu: FC<RenderOptions> = (props) => (
  <Minimize
    minimize={props.divShadowMinimized}
    setMinimize={props.setDivShadowMinimized}
  />
);

export const DivGradientMenu: FC<RenderOptions> = (props) => ( <>
  <Chooser
    name="Mode"
    mode="selector"
    options={[
      { value: "linear-horizontal", label: "Linear Gradient Horizontal" },
      { value: "linear-vertical", label: "Linear Gradient Vertical" },
      { value: "conic", label: "Conic Gradient" }
    ]}
    value={props.divGradientMode}
    setValue={props.setDivGradientMode}
  />
  <Overlap {...props} />
  <AdaptDPR {...props} />
</> );

export const DivGridMenu: FC<RenderOptions> = (props) => (
  <Chooser
    name="Mode"
    mode="selector"
    options={[
      { value: "vertical-horizontal", label: "Row Flow" },
      { value: "horizontal-vertical", label: "Column Flow" },
      { value: "minimized", label: "Draw One-side Cells Only" }
    ]}
    value={props.divGridMode}
    setValue={props.setDivGridMode}
  />
);

export const DivFlexMenu: FC<RenderOptions> = (props) => (
  <Chooser
    name="Mode"
    mode="selector"
    options={[
      { value: "vertical-horizontal", label: "Vertical → Horizontal" },
      { value: "horizontal-vertical", label: "Horizontal → Vertical" }
    ]}
    value={props.divFlexMode}
    setValue={props.setDivFlexMode}
  />
);

export const DivAbsoluteMenu: FC<RenderOptions> = (props) => ( <>
  <Minimize
    minimize={props.divAbsoluteMinimized}
    setMinimize={props.setDivAbsoluteMinimized}
  />
  <UseNthOfType {...props} />
</> );

export const DivInlineBlockMenu: FC<RenderOptions> = (props) => ( <>
  <Chooser
    name="Writing Mode"
    mode="segmented"
    options={[
      { value: "horizontal-tb", label: "Horizontal T→B" },
      { value: "vertical-rl", label: "Vertical R→L" },
      { value: "vertical-lr", label: "Vertical L→R" }
    ]}
    value={props.divInlineBlockWritingMode}
    setValue={props.setDivInlineBlockWritingMode}
  />
  <Chooser
    name="Direction"
    mode="segmented"
    options={[
      { value: "ltr", label: "LTR" },
      { value: "rtl", label: "RTL" }
    ]}
    value={props.divInlineBlockDirection}
    setValue={props.setDivInlineBlockDirection}
  />
</> );

export const DivSublatticesMenu: FC<RenderOptions> = (props) => ( <>
  <Chooser
    name="Draw as"
    mode="selector"
    options={[
      { value: "border", label: "Border" },
      { value: "conic-gradient", label: "Conic Gradient" }
    ]}
    value={props.divSublatticesDrawMode}
    setValue={props.setDivSublatticesDrawMode}
  />
  <UseNthOfType {...props} />
  <Chooser
    name="Layout"
    mode="segmented"
    options={[
      { value: "layout1", label: "1" },
      { value: "layout2", label: "2" }
    ]}
    value={props.divSublatticeLayout}
    setValue={props.setDivSublatticeLayout}
  />
  <Chooser
    name="Rotation angle"
    mode="segmented"
    options={[
      { value: "45deg", label: "45°" },
      { value: "135deg", label: "135°" },
      { value: "225deg", label: "225°" },
      { value: "315deg", label: "315°" }
    ]}
    value={props.divSublatticesAngle}
    setValue={props.setDivSublatticesAngle}
  />
  <Chooser
    name="Rotate"
    mode="selector"
    options={[
      { value: "per-cells", label: "per cells" },
      { value: "whole-lattice", label: "whole lattice" }
    ]}
    value={props.divSublatticeRotateMode}
    setValue={props.setDivSublatticeRotateMode}
  />
</> );

export const SvgPathMenu: FC<RenderOptions> = (props) => ( <>
  <Chooser
    name="Draw as"
    mode="selector"
    options={[
      { value: "fill", label: "Fill rect" },
      { value: "horizontal-stroke", label: "Stroke horizontal line" },
      { value: "vertical-stroke", label: "Stroke vertical line" }
    ]}
    value={props.svgPathDrawAs}
    setValue={props.setSvgPathDrawAs}
  />
  <Minimize
    minimize={props.svgPathMinimized}
    setMinimize={props.setSvgPathMinimized}
  />
</> );

export const SvgPolygonMenu: FC<RenderOptions> = (props) => (
  <Minimize
    minimize={props.svgPolygonMinimized}
    setMinimize={props.setSvgPolygonMinimized}
  />
);

export const SvgRectLineMenu: FC<RenderOptions> = (props) => ( <>
  <Chooser
    name="Draw as"
    mode="selector"
    options={[
      { value: "rect-fill", label: "Rect (fill)" },
      { value: "horizontal-line-stroke", label: "Horizontal Line (stroke)" },
      { value: "vertical-line-stroke", label: "Vertical Line (stroke)" }
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

export const SvgGradientMenu: FC<RenderOptions> = (props) => ( <>
  <Chooser
    name="Draw as"
    mode="selector"
    options={[
      { value: "linear-horizontal", label: "Horizontal Linear Gradient" },
      { value: "linear-vertical", label: "Vertical Linear Gradient" }
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

export const InputMenu: FC<RenderOptions> = (props) => ( <>
  <Chooser
    name="Type"
    mode="selector"
    options={[
      { value: "checkbox", label: "Checkbox" },
      { value: "radio", label: "Radio Button" }
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
