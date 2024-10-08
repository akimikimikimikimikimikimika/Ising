/* eslint-disable react-refresh/only-export-components */
import { FC, memo, ReactNode } from "react";
import { Renderer, RendererFC, Bits } from "../utils/types";
import { ArrayUtils, indexToXY, minifyCss, isNil } from "../utils/utils";
import { SvgRectLineDrawAs as DrawAs } from "../renderer_utils/types";
import { SvgRectLineMenu as Menu } from "../renderer_utils/MenuOptions";

const View: RendererFC = (props) => (
  <Root side={props.side}>
    <OptionsDepedentStyle
      drawAs={props.svgRectLineDrawAs}
      minimized={props.svgRectLineMinimized}
      overlap={props.overlap}
    />
    <Cells
      drawAs={props.svgRectLineDrawAs}
      minimized={props.svgRectLineMinimized}
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

type OptionsDepedentStyleProps = {
  drawAs: DrawAs.Type;
  minimized: boolean;
  overlap: number;
};

const OptionsDepedentStyle: FC<OptionsDepedentStyleProps> = memo((props) => {
  switch (props.drawAs) {
    case "rect-fill": {
      const src = minifyCss(`
        .view > rect {
          stroke-width: 0;
          stroke: transparent;
        }
        ${!props.minimized ? `
          .view > rect.on {
            fill: var(--on-color);
          }
          .view > rect.off {
            fill: var(--off-color);
          }
        ` : ""}
      `);
      return <style>{src}</style>;
    }
    case "horizontal-line-stroke":
    case "vertical-line-stroke": {
      const src = minifyCss(`
        line {
          stroke-width:${1+props.overlap};
        }
        ${!props.minimized ? `
          .view > line.on {
            stroke: var(--on-color);
          }
          .view > line.off {
            stroke: var(--off-color);
          }
        ` : ""}
      `);
      return <style>{src}</style>;
    }
  }
});

type CellsProps = {
  drawAs: DrawAs.Type;
  minimized: boolean;
  overlap: number;
  side: number;
  bits: Bits;
};

const Cells: FC<CellsProps> = memo((props) => {
  const { bits, side, drawAs, overlap } = props;


  if ( props.minimized ) {
    const { majority, minors } = ArrayUtils.minimize(bits, side);

    const elemName = drawAs === DrawAs.RectFill ? "rect" : "line";
    const propName = drawAs === DrawAs.RectFill ? "fill" : "stroke";
    const styleSrc = minifyCss(`
      .view {
        background-color: var(--${ majority ? "on" : "off" }-color);
      }
      .view > ${elemName} {
        ${propName}: var(--${ majority ? "off" : "on" }-color);
      }
    `);

    return <>
      <style>{styleSrc}</style>
      {minors.map((position,idx) => (
        <Cell
          key={idx}
          drawAs={drawAs}
          overlap={0}
          x={position.x} y={position.y}
        />
      ))}
    </>;
  }

  else {
    return <>
      {bits.map((value,idx) => {
        const { x, y } = indexToXY(idx, side);
        return (
          <Cell
            key={idx}
            drawAs={drawAs}
            overlap={overlap}
            x={x} y={y}
            value={value}
          />
        );
      })}
    </>;
  }

});

type CellProps = {
  drawAs: DrawAs.Type;
  overlap: number;
  x: number;
  y: number;
  value?: Nullable<boolean>;
};

const Cell: FC<CellProps> = memo((props) => {
  const className =
    isNil(props.value) ? undefined :
    props.value ? "on" : "off";

  switch (props.drawAs) {
    case DrawAs.RectFill: {
      const side = 1 + props.overlap;
      return (
        <rect
          className={className}
          x={props.x} y={props.y}
          width={side}
          height={side}
        />
      );
    }
    case DrawAs.HorizontalLineStroke: {
      const length = 1 + props.overlap;
      const center = ( 1 + props.overlap ) / 2;
      return (
        <line
          className={className}
          x1={props.x} x2={props.x+length}
          y1={props.y+center} y2={props.y+center}
        />
      );
    }
    case DrawAs.VerticalLineStroke: {
      const length = 1 + props.overlap;
      const center = ( 1 + props.overlap ) / 2;
      return (
        <line
          className={className}
          x1={props.x+center} x2={props.x+center}
          y1={props.y} y2={props.y+length}
        />
      );
    }
  }
});

export const renderer: Renderer = {
  name: "SVG Rect / Line",
  isActive: Boolean(window.SVGSVGElement),
  view: View,
  menu: Menu
};