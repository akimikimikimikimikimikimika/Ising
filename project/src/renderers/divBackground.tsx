/* eslint-disable react-refresh/only-export-components */
import { FC, memo } from "react";
import { DivBackgroundMenu as Menu } from "./MenuOptions";
import { Bits, RendererDefs } from "../utils/types";
import { ArrayUtils, cssSupports, minifyCss } from "../utils/utils";

const View: FC<RendererDefs.RendererProps> = (props) => (
  <div className="view">
    <StaticStyle />
    <OptionsDependentStyle
      minimized={props.divBackgroundMinimized}
      side={props.side}
      overlap={props.overlap}
      adaptDevicePixelRatio={props.adaptDevicePixelRatio}
    />
    <DynamicStyle
      minimized={props.divBackgroundMinimized}
      side={props.side}
      bits={props.bits}
      overlap={props.overlap}
    />
  </div>
);

const StaticStyle: FC = memo(() => {
  const src = minifyCss(`
    .view {
      width: calc( 100% * var(--device-pixel-ratio) );
      height: calc( 100% * var(--device-pixel-ratio) );
      transform: scale( calc( 1 / var(--device-pixel-ratio) ) );
      transform-origin: left top;
      background-repeat: no-repeat;
      background-origin: border-box;
      background-clip: border-box;
      --on-cell-bg: radial-gradient( var(--on-color), var(--on-color) );
      --off-cell-bg: radial-gradient( var(--off-color), var(--off-color) );
    }
  `);

  return <style>{src}</style>;
});

type OptionsDependentStyleProps = {
  minimized: boolean;
  side: number;
  overlap: number;
  adaptDevicePixelRatio: boolean;
};

const OptionsDependentStyle: FC<OptionsDependentStyleProps> = memo((props) => {

  if (!props.minimized) {
    const denom = props.side - 1 - props.overlap;

    const position =
      Array.from({ length: props.side**2 })
      .map((_,idx) => {
        const x = idx % props.side;
        const y = Math.floor( idx / props.side );

        const x_adjusted = x - props.overlap;
        const y_adjusted = y - props.overlap;

        return {
          x: `calc( 100% / ${denom} * ${x_adjusted} )`,
          y: `calc( 100% / ${denom} * ${y_adjusted} )`
        };
      });

    const positionX = position.map(p => p.x).join(", ");
    const positionY = position.map(p => p.y).join(", ");
    const size = `calc( 100% / ${props.side} * ${1+props.overlap} )`;

    const devicePixelRatio =
      props.adaptDevicePixelRatio ? window.devicePixelRatio : 1;

    const src = minifyCss(`
      .view {
        background-position-x: ${positionX};
        background-position-y: ${positionY};
        background-size: ${size} ${size};
        --device-pixel-ratio: ${devicePixelRatio};
      }
    `);

    return <style>{src}</style>;
  }

  else {
    const size = `calc( 100% / ${props.side} )`;
    const src = minifyCss(`
      .view {
        background-size: ${size} ${size};
        --device-pixel-ratio: ${devicePixelRatio};
      }
    `);
    return <style>{src}</style>;
  }

});

type DynamicStyleProps = {
  minimized: boolean;
  side: number;
  bits: Bits;
  overlap: number;
};

const DynamicStyle: FC<DynamicStyleProps> = memo((props) => {

  if (!props.minimized) {
    const images =
      props.bits.map(
        value =>
          value ? "var(--on-cell-bg)" : "var(--off-cell-bg)"
      ).join(", ");
    const src = minifyCss(`
      .view {
        background-image: ${images};
      }
    `);

    return <style>{src}</style>;
  }

  else {
    const { bits, side } = props;
    const { majority, minors } = ArrayUtils.minimize(bits, side);

    const denom = side - 1;

    const position =
      minors.map((position) => {
        const { x, y } = position;
        const position_x = `calc( 100% / ${denom} * ${x} )`;
        const position_y = `calc( 100% / ${denom} * ${y} )`;
        return `${position_x} ${position_y}`;
      }).join(", ");

    const image =
      Array(minors.length)
      .fill( majority ? "var(--off-cell-bg)" : "var(--on-cell-bg)" )
      .join(", ");
    const color = majority ? "var(--on-color)" : "var(--off-color)";

    const src = minifyCss(`
      .view {
        background-position: ${position};
        background-image: ${image};
        background-color: ${color};
      }
    `);

    return <style>{src}</style>;
  }

});

export const renderer : RendererDefs.Renderer = {
  name: "DIV Background",
  willInstall: cssSupports(
    [ "background-size", "calc( 100% / 100 )" ],
    [ "background-image", "radial-gradient(red, red)" ]
  ),
  view: View,
  menu: Menu
};