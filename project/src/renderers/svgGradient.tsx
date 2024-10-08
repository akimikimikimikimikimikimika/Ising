/* eslint-disable react-refresh/only-export-components */
import { FC, memo, ReactNode } from "react";
import { Renderer, RendererFC, Bits } from "../utils/types";
import { ArrayUtils, minifyCss } from "../utils/utils";
import { SvgGradientDrawAs as DrawAs } from "../renderer_utils/types";
import { SvgGradientMenu as Menu } from "../renderer_utils/MenuOptions";

const View: RendererFC = (props) => (
  <Root side={props.side}>
    <StaticStyle />
    <Cells
      drawAs={props.svgGradientDrawAs}
      overlap={props.overlap}
      side={props.side}
      bits={props.bits}
    />
  </Root>
);

type RootProps = {
  side: number;
  children: ReactNode;
};

const Root: FC<RootProps> = memo((props) => (
  <svg
    className="view"
    viewBox={`0 0 ${props.side} ${props.side}`}
    preserveAspectRatio="none"
  >
    {props.children}
  </svg>
));

const StaticStyle: FC = memo(() => {
  const src = minifyCss(`
    .view > rect {
      stroke-width: 0;
      stroke: transparent;
    }
    .view > linearGradient > stop.on {
      stop-color: var(--on-color);
    }
    .view > linearGradient > stop.off {
      stop-color: var(--off-color);
    }
  `);

  return <style>{src}</style>;
});

const processors: { [key in DrawAs.Type]: ArrayUtils.Process } = {
  [DrawAs.HorizontalLineStroke]: ArrayUtils.processors.identity,
  [DrawAs.VerticalLineStroke]: ArrayUtils.processors.transpose
}

type CellsProps = {
  drawAs: DrawAs.Type;
  overlap: number;
  side: number;
  bits: Bits;
};

const Cells: FC<CellsProps> = memo((props) => {
  const { side, overlap, drawAs, bits } = props;

  const bitsNested = ArrayUtils.nested(
    ArrayUtils.performProcess(
      bits,
      processors[drawAs]
    )
  );

  return <>{bitsNested.map((bits,idx) => (
    <Line
      key={idx}
      lineIdx={idx}
      drawAs={drawAs}
      overlap={overlap}
      side={side}
      bits={bits}
    />
  ))}</>;
});

type LineProps = {
  drawAs: DrawAs.Type;
  overlap: number;
  lineIdx: number;
  side: number;
  bits: Bits;
};

const Line: FC<LineProps> = memo((props) => {
  const { lineIdx, bits, side, drawAs, overlap } = props;

  const stops = ArrayUtils.makeStops(bits);

  type SvgStop = {
    offset: number;
    className: string;
  };
  const svgStops =
    stops.map(stop => {
      const className = stop.value ? "on" : "off";
      return [
        { offset: stop.begin / side, className },
        { offset: stop.end   / side, className }
      ] as SvgStop[];
    }).flat();

  const stopNodes = <>{svgStops.map((stop,stopIdx) => (
    <stop
      key={stopIdx}
      offset={stop.offset}
      className={stop.className}
    />
  ))}</>;

  switch (drawAs) {

    case DrawAs.HorizontalLineStroke:
      return ( <>
        <rect
          x={0} y={lineIdx}
          width={side} height={1+overlap}
          fill={`url(#lg${lineIdx})`}
        />
        <linearGradient
          id={`lg${lineIdx}`}
          x1="0" y1="0" x2="1" y2="0"
        >{stopNodes}</linearGradient>
      </> );

    case DrawAs.VerticalLineStroke:
      return ( <>
        <rect
          x={lineIdx} y={0}
          width={1+overlap} height={side}
          fill={`url(#lg${lineIdx})`}
        />
        <linearGradient
          id={`lg${lineIdx}`}
          x1="0" y1="0" x2="0" y2="1"
        >{stopNodes}</linearGradient>
      </> );

  }
});

export const renderer: Renderer = {
  name: "SVG Gradient Rect",
  isActive: Boolean(window.SVGSVGElement),
  view: View,
  menu: Menu
};