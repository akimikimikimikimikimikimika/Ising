/* eslint-disable react-refresh/only-export-components */
import { FC, memo, ReactNode } from "react";
import { SvgPolygonMenu as Menu } from "./MenuOptions";
import { Bits, RendererDefs } from "../utils/types";
import { ArrayUtils, minifyCss } from "../utils/utils";

const View: FC<RendererDefs.RendererProps> = (props) => (
  <Root side={props.side}>
    <StaticStyle />
    <MinimizedDepedentStyle minimized={props.svgPolygonMinimized} />
    <Cells
      minimized={props.svgPolygonMinimized}
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
    .view > polygon {
      stroke-width: 0;
      stroke: transparent;
    }
  `);

  return <style>{src}</style>
});

type MinimizedDepedentStyleProps = {
  minimized: boolean;
};

const MinimizedDepedentStyle: FC<MinimizedDepedentStyleProps> = memo((props) => {
  if (!props.minimized) {
    const src = minifyCss(`
      .view > polygon.on {
        fill: var(--on-color);
      }
      .view > polygon.off {
        fill: var(--off-color);
      }
    `);

    return <style>{src}</style>
  }
  else return <></>;
});

type CellsProps = {
  minimized: boolean;
  side: number;
  bits: Bits;
};

const Cells: FC<CellsProps> = memo((props) => {
  const { bits, side } = props;

  if ( !props.minimized ) {
    const { on, off } = ArrayUtils.getPolygonPoints(bits, side, false);

    const [ onPointsStr, offPointsStr ] =
      [ on, off ].map( points => (
        points.map( ({ x, y }) => `${x},${y}` )
        .join(" ")
      ));

    return <>
      <polygon className="on" points={onPointsStr} />
      <polygon className="off" points={offPointsStr} />
    </>;
  }

  else {
    const { points, majority } = ArrayUtils.getPolygonPoints(bits, side, true)
    const minorPointsStr =
      points.map(
        ({ x, y }) => `${x},${y}`
      ).join(" ");

    const styleSrc = minifyCss(`
      .view {
        background-color: var(--${ majority ? "on" : "off" }-color);
      }
      .view > polygon {
        fill: var(--${ majority ? "off" : "on" }-color);
      }
    `);

    return <>
      <style>{styleSrc}</style>
      <polygon points={minorPointsStr} />
    </>;
  }

});

export const renderer : RendererDefs.Renderer = {
  name: "SVG Polygon",
  isActive: Boolean(window.SVGSVGElement),
  view: View,
  menu: Menu
};