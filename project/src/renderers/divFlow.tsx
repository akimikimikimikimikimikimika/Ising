/* eslint-disable react-refresh/only-export-components */
import { FC, memo } from "react";
import { Renderer, RendererFC, Bits } from "../utils/types";
import { ArrayUtils, cssSupports, minifyCss } from "../utils/utils";
import {
  DivFlowWritingMode as WritingMode,
  DivFlowDirection   as Direction
} from "../renderer_utils/types";
import { DivFlowMenu as Menu } from "../renderer_utils/MenuOptions";

const View: RendererFC = (props) => (
  <div className="view">
    <StaticStyle />
    <ModeDependentStyle
      writingMode={props.divFlowWritingMode}
      direction={props.divFlowDirection}
    />
    <SizeDependentStyle side={props.side} />
    <Cells
      side={props.side} bits={props.bits}
      writingMode={props.divFlowWritingMode}
      direction={props.divFlowDirection}
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
  writingMode: WritingMode.Type;
  direction: Direction.Type;
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

type Processors = { [key in WritingMode.Type]: { [key in Direction.Type]: ArrayUtils.Process } };
const processors: Processors = {
  [WritingMode.HorizontalTB]: {
    [Direction.LTR]: identity,
    [Direction.RTL]: flipX
  },
  [WritingMode.VerticalRL]: {
    [Direction.LTR]: multiply( transpose, flipX ),
    [Direction.RTL]: multiply( transpose, flipX, flipY )
  },
  [WritingMode.VerticalLR]: {
    [Direction.LTR]: transpose,
    [Direction.RTL]: multiply( transpose, flipY )
  }
};

type CellsProps = {
  writingMode: WritingMode.Type;
  direction: Direction.Type;
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

export const renderer: Renderer = {
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