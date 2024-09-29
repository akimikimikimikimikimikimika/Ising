/* eslint-disable react-refresh/only-export-components */
import { FC, memo } from "react";
import { DivFlowMenu as Menu } from "../renderer_utils/MenuOptions";
import { Bits, RendererDefs } from "../utils/types";
import { ArrayUtils, cssSupports, minifyCss } from "../utils/utils";

export const WritingModeConsts = {
  HorizontalTB: "horizontal-tb",
  VerticalRL: "vertical-rl",
  VerticalLR: "vertical-lr",
} as const;
export type WritingMode = Literal<typeof WritingModeConsts>;

export const DirectionConsts = {
  LTR: "ltr", RTL: "rtl",
} as const;
export type Direction = Literal<typeof DirectionConsts>;

const View: FC<RendererDefs.RendererProps> = (props) => (
  <div className="view">
    <StaticStyle />
    <ModeDependentStyle
      writingMode={props.divInlineBlockWritingMode}
      direction={props.divInlineBlockDirection}
    />
    <SizeDependentStyle side={props.side} />
    <Cells
      side={props.side} bits={props.bits}
      writingMode={props.divInlineBlockWritingMode}
      direction={props.divInlineBlockDirection}
    />
  </div>
);

const StaticStyle: FC = memo(() => {
  const src = minifyCss(`
    .view {
      overflow: hidden;
      line-height: 0;
      display: block flow;
    }
    .view > div {
      position: relative;
      display: inline-block;
      display: inline flow-root;
      box-sizing: border-box;
      width: calc( 100% / var(--side) );
      height: calc( 100% / var(--side) );
    }
    .view > div.on {
      background-color: var(--on-color);
    }
    .view > div.off {
      background-color: var(--off-color);
    }
  `);

  return <style>{src}</style>;
});

type ModeDependentStyleProps = {
  writingMode: WritingMode;
  direction: Direction;
};

const ModeDependentStyle: FC<ModeDependentStyleProps> = memo((props) => {
  const src = minifyCss(`
    .view {
      writing-mode: ${props.writingMode};
      direction: ${props.direction};
    }
  `);

  return <style>{src}</style>;
});

type SizeDependentStyleProps = {
  side: number;
};

const SizeDependentStyle: FC<SizeDependentStyleProps> = memo(({ side }) => {
  const src = minifyCss(`
    .view {
      --side: ${side};
    }
  `);

  return <style>{src}</style>;
});

const { identity, flipX, flipY, transpose } = ArrayUtils.processors;
const multiply = ArrayUtils.multiplyProcess;

type Processors = { [key in WritingMode]: { [key in Direction]: ArrayUtils.Process } };
const processors: Processors = {
  "horizontal-tb": {
    "ltr": identity,
    "rtl": flipX
  },
  "vertical-rl": {
    "ltr": multiply( transpose, flipX ),
    "rtl": multiply( transpose, flipX, flipY )
  },
  "vertical-lr": {
    "ltr": transpose,
    "rtl": multiply( transpose, flipY )
  }
};

type CellsProps = {
  writingMode: WritingMode;
  direction: Direction;
  side: number;
  bits: Bits;
};
const Cells: FC<CellsProps> = memo((props) => {
  const processedBits = ArrayUtils.performProcess(
    props.bits,
    processors[props.writingMode][props.direction]
  );
  return <>{processedBits.map((value,idx) => (
    <div
      key={idx}
      className={value ? "on" : "off"}
    />
  ))}</>;
});

export const renderer : RendererDefs.Renderer = {
  name: "DIV Flow",
  isActive: cssSupports(
    // equivalent to display: inline flow-root;
    [ "display", "inline-block" ],
    [ "width", "calc( 100% / 8 * 1 )" ],
    [ "writing-mode", "horizontal-tb" ],
    [ "direction", "ltr" ]
  ),
  view: View,
  menu: Menu
};