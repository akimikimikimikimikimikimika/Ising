/* eslint-disable @typescript-eslint/no-namespace */

export namespace CanvasContext {
  export const TwoD = "2d";
  export const Bitmap = "bitmaprenderer";

  type Context =
    | typeof TwoD
    | typeof Bitmap;
  export type Type = Context;
}

export namespace DivGradientMode {
  export const LinearHorizontal = "linear-horizontal";
  export const LinearVertical = "linear-vertical";
  export const Conic = "conic";

  type Mode =
    | typeof LinearHorizontal
    | typeof LinearVertical
    | typeof Conic;
  export type Type = Mode;
}

export namespace DivGridMode {
  export const VerticalHorizontal = "vertical-horizontal";
  export const HorizontalVertical = "horizontal-vertical";
  export const Minimized = "minimized";

  type Mode =
    | typeof VerticalHorizontal
    | typeof HorizontalVertical
    | typeof Minimized;
  export type Type = Mode;
}

export namespace DivFlexMode {
  export const VerticalHorizontal = "vertical-horizontal";
  export const HorizontalVertical = "horizontal-vertical";

  type Mode =
    | typeof VerticalHorizontal
    | typeof HorizontalVertical;
  export type Type = Mode;
}

export namespace DivFlowWritingMode {
  export const HorizontalTB = "horizontal-tb";
  export const VerticalRL = "vertical-rl";
  export const VerticalLR = "vertical-lr";

  type WritingMode =
    | typeof HorizontalTB
    | typeof VerticalRL
    | typeof VerticalLR;
  export type Type = WritingMode;
}

export namespace DivFlowDirection {
  export const LTR = "ltr";
  export const RTL = "rtl";

  type Direction = typeof LTR | typeof RTL;
  export type Type = Direction;
}

export namespace DivSublatticesDrawMode {
  export const Border = "border";
  export const ConicGradient = "conic-gradient";

  type DrawMode = typeof Border | typeof ConicGradient;
  export type Type = DrawMode;
}

export namespace DivSublatticesRotateMode {
  export const PerCells = "per-cells";
  export const WholeLattice = "whole-lattice";

  type RotateMode = typeof PerCells | typeof WholeLattice;
  export type Type = RotateMode;
}

export namespace DivSublatticesLayout {
  export const One = 1;
  export const Two = 2;

  type Layout = typeof One | typeof Two;
  export type Type = Layout;
}

export namespace DivSublatticesAngle {
  export const deg45  =  "45deg";
  export const deg135 = "135deg";
  export const deg225 = "225deg";
  export const deg315 = "315deg";

  type Angle = typeof deg45 | typeof deg135 | typeof deg225 | typeof deg315;
  export type Type = Angle;
}

export namespace SvgPathDrawAs {
  export const Fill = "fill";
  export const HorizontalStroke = "horizontal-stroke";
  export const VerticalStroke = "vertical-stroke";

  type DrawAs =
    | typeof Fill
    | typeof HorizontalStroke
    | typeof VerticalStroke;
  export type Type = DrawAs;
}

export namespace SvgRectLineDrawAs {
  export const RectFill = "rect-fill";
  export const HorizontalLineStroke = "horizontal-line-stroke";
  export const VerticalLineStroke = "vertical-line-stroke";

  type DrawAs =
    | typeof RectFill
    | typeof HorizontalLineStroke
    | typeof VerticalLineStroke;
  export type Type = DrawAs;
}

export namespace SvgGradientDrawAs {
  export const HorizontalLineStroke = "linear-horizontal";
  export const VerticalLineStroke = "linear-vertical";

  type DrawAs =
    | typeof HorizontalLineStroke
    | typeof VerticalLineStroke;
  export type Type = DrawAs;
}

export namespace InputType {
  export const Checkbox = "checkbox";
  export const Radio = "radio";

  export type Type = typeof Checkbox | typeof Radio;
}
