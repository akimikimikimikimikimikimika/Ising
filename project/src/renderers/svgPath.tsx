/* eslint-disable react-refresh/only-export-components */
import { FC, memo, ReactNode } from "react";
import { SvgPathMenu as Menu } from "../renderer_utils/MenuOptions";
import { Bits, RendererDefs } from "../utils/types";
import { ArrayUtils, minifyCss } from "../utils/utils";

export const DrawAsConsts = {
  Fill: "fill",
  HorizontalStroke: "horizontal-stroke",
  VerticalStroke: "vertical-stroke",
} as const;
export type DrawAs = Literal<typeof DrawAsConsts>;

const View: FC<RendererDefs.RendererProps> = (props) => (
  <Root side={props.side}>
    <OptionsDepedentStyle
      drawAs={props.svgPathDrawAs}
      minimized={props.svgPathMinimized}
    />
    <Cells
      drawAs={props.svgPathDrawAs}
      minimized={props.svgPathMinimized}
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
  drawAs: DrawAs;
  minimized: boolean;
};

const OptionsDepedentStyle: FC<OptionsDepedentStyleProps> = memo((props) => {
  switch (props.drawAs) {
    case "fill": {
      const src = minifyCss(`
        .view > path {
          stroke-width: 0;
          stroke: transparent;
        }
        ${!props.minimized ? `
          .view > path.on {
            fill: var(--on-color);
          }
          .view > path.off {
            fill: var(--off-color);
          }
        ` : ""}
      `);
      return <style>{src}</style>;
    }
    case "horizontal-stroke":
    case "vertical-stroke": {
      const src = minifyCss(`
        line {
          stroke-width: 1;
        }
        ${!props.minimized ? `
          .view > path.on {
            stroke: var(--on-color);
          }
          .view > path.off {
            stroke: var(--off-color);
          }
        ` : ""}
      `);
      return <style>{src}</style>;
    }
  }
});

type CellsProps = {
  drawAs: DrawAs;
  minimized: boolean;
  side: number;
  bits: Bits;
};

const Cells: FC<CellsProps> = memo((props) => {
  const { bits, side, drawAs } = props;

  if ( props.minimized ) {
    const { majority, minors } = ArrayUtils.minimize(bits, side);

    const propName = drawAs === "fill" ? "fill" : "stroke";
    const styleSrc = minifyCss(`
      .view {
        background-color: var(--${ majority ? "on" : "off" }-color);
      }
      .view > path {
        ${propName}: var(--${ majority ? "off" : "on" }-color);
      }
    `);

    const d =
      minors.map(
        ({ x, y }) => makePathCommand( drawAs, x, y )
      )
      .join(" ");

    return <>
      <style>{styleSrc}</style>
      <path d={d} />
    </>;
  }

  else {
    const bitsWithCoords = bits.map((value, idx) => {
      const x = idx % side;
      const y = Math.floor( idx / side );
      return [ value, x, y ] as [ boolean, number, number ];
    });

    const dForOn =
      bitsWithCoords.filter(([value,,]) => value)
      .map(([,x,y]) => makePathCommand(drawAs,x,y))
      .join(" ");

    const dForOff =
      bitsWithCoords.filter(([value,,]) => !value)
      .map(([,x,y]) => makePathCommand(drawAs,x,y))
      .join(" ");

    return <>
      <path className="on" d={dForOn} />
      <path className="off" d={dForOff} />
    </>;
  }

});

const makePathCommand = (drawAs: DrawAs, x: number, y: number) => {
  switch (drawAs) {
    case "fill":
      return `M ${x},${y} h +1 v +1 h -1 z`;
    case "horizontal-stroke":
      return `M ${x},${y+0.5} h +1`;
    case "vertical-stroke":
      return `M ${x+0.5},${y} v +1`;
  }
};

export const renderer : RendererDefs.Renderer = {
  name: "SVG Path",
  isActive: Boolean(window.SVGSVGElement),
  view: View,
  menu: Menu
};