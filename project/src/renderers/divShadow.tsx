/* eslint-disable react-refresh/only-export-components */
import { FC, memo } from "react";
import { DivShadowMenu as Menu } from "./MenuOptions";
import { Bits, RendererDefs } from "../utils/types";
import { ArrayUtils, cssSupports, minifyCss } from "../utils/utils";

const View: FC<RendererDefs.RendererProps> = (props) => (
  <div className="view">
    <StaticStyle />
    <SizeDependentStyle side={props.side} />
    <DynamicStyle
      minimized={props.divShadowMinimized}
      side={props.side}
      bits={props.bits}
    />
  </div>
);

const StaticStyle: FC = memo(() => {
  const src = minifyCss(`
    .view {
      container-type: size;
    }
    .view::before {
      content: "";
      position: absolute;
      right: 100%;
      bottom: 100%;
      width: calc( 100cqmin / var(--side) );
      height: calc( 100cqmin / var(--side) );
    }
  `);

  return <style>{src}</style>;
});

type SizeDependentStyleProps = {
  side: number;
};

const SizeDependentStyle: FC<SizeDependentStyleProps> = memo((props) => {
  const src = minifyCss(`
    .view::before {
      --side: ${props.side};
    }
  `);

  return <style>{src}</style>;
});

type DynamicStyleProps = {
  minimized: boolean;
  side: number;
  bits: Bits;
};

const DynamicStyle: FC<DynamicStyleProps> = memo((props) => {
  const { bits, side } = props;

  if (!props.minimized) {
    const boxShadow =
    bits.map((value,idx) => {
      const x = idx % side;
      const y = Math.floor( idx / side );

      const color = value ? "var(--on-color)" : "var(--off-color)";

      const position_x = `calc( ${x+1} * 100cqmin / ${side} )`;
      const position_y = `calc( ${y+1} * 100cqmin / ${side} )`;

      return `${color} ${position_x} ${position_y}`;
    })
    .join(", ");

    const src = minifyCss(`
      .view::before {
        width: calc( 100cqmin / ${side} );
        height: calc( 100cqmin / ${side} );
        box-shadow: ${boxShadow};
      }
    `);

    return <style>{src}</style>;
  }

  else {
    const { majority, minors } = ArrayUtils.minimize(bits, side);

    const minorColor = majority ? "var(--off-color)" : "var(--on-color)";
    const boxShadow =
      minors.map((position) => {
        const position_x = `calc( ${position.x+1} * 100cqmin / ${side} )`;
        const position_y = `calc( ${position.y+1} * 100cqmin / ${side} )`;
        return `${minorColor} ${position_x} ${position_y}`;
      })
      .join(", ");
    const backgroundColor = majority ? "var(--on-color)" : "var(--off-color)";

    const src = minifyCss(`
      .view {
        background-color: ${backgroundColor};
      }
      .view::before {
        box-shadow: ${boxShadow};
      }
    `);

    return <style>{src}</style>;
  }

});

export const renderer : RendererDefs.Renderer = {
  name: "DIV Shadow",
  isActive: cssSupports(
    [ "container-type", "size" ],
    [ "box-shadow", "10cqmin 10cqmin 0 0 black" ]
  ),
  view: View,
  menu: Menu
};