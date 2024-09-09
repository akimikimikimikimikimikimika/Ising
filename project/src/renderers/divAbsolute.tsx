/* eslint-disable react-refresh/only-export-components */
import { FC, memo, CSSProperties } from "react";
import { DivAbsoluteMenu as Menu } from "./MenuOptions";
import { Bits, RendererDefs } from "../utils/types";
import { ArrayUtils, cssSupports, minifyCss } from "../utils/utils";

const View: FC<RendererDefs.RendererProps> = (props) => (
  <div className="view">
    <StaticStyle />
    <OptionsDependentStyle
      minimized={props.divAbsoluteMinimized}
      side={props.side}
    />
    <Cells
      minimized={props.divAbsoluteMinimized}
      side={props.side}
      bits={props.bits}
    />
  </div>
);

const StaticStyle: FC = memo(() => {
  const src = minifyCss(`
    .view > div {
      position: absolute;
      display: block;
      box-sizing: border-box;
      left: calc( 100% / var(--side) * var(--x) );
      right: calc( 100% / var(--side) * ( var(--side) - 1 - var(--x) ) );
      top: calc( 100% / var(--side) * var(--y) );
      bottom: calc( 100% / var(--side) * ( var(--side) - 1 - var(--y) ) );
    }
    .view > .on {
      background-color: var(--on-color);
    }
    .view > .off {
      background-color: var(--off-color);
    }
  `);

  return <style>{src}</style>;
});

type OptionsDependentStyleProps = {
  minimized: boolean;
  side: number;
};

const OptionsDependentStyle: FC<OptionsDependentStyleProps> = memo(({ minimized, side }) => {

  if (!minimized) {
    const rules =
      Array.from({ length: side })
      .map((_,idx) => {

        const xConst = idx + 1;
        const exprX = `${side}n + ${xConst}`;

        const yLower =  idx    * side + 1;
        const yUpper = (idx+1) * side;
        const exprYLower = ` n + ${yLower}`;
        const exprYUpper = `-n + ${yUpper}`;

        return `
          .view > div:nth-of-type(${exprX}) {
            --x: ${idx};
          }
          .view > div:nth-of-type(${exprYLower}):nth-of-type(${exprYUpper}) {
            --y: ${idx};
          }
        `;
      });

    const src = minifyCss(`
      .view {
        --side: ${side};
      }
      .view > .on {
        background-color: var(--on-color);
      }
      .view > .off {
        background-color: var(--off-color);
      }
      ${rules.join("")}
    `);

    return <style>{src}</style>;
  }

  else {
    const src = minifyCss(`
      .view {
        --side: ${side};
      }
    `);

    return <style>{src}</style>;
  }

});

type CellsProps = {
  minimized: boolean;
  side: number;
  bits: Bits;
};

const Cells: FC<CellsProps> = memo((props) => {

  if (!props.minimized) {
    return <>{props.bits.map((value,idx) => (
      <div
        key={idx}
        className={value ? "on" : "off"}
      />
    ))}</>;
  }

  else {
    const { bits, side } = props;
    const { majority, minors } = ArrayUtils.minimize(bits, side);

    const styleSrc = minifyCss(`
      .view {
        background-color: var(--${ majority ? "on" : "off" }-color);
      }
      .view > div {
        background-color: var(--${ majority ? "off" : "on" }-color);
      }
    `);

    return <>
      <style>{styleSrc}</style>
      {minors.map((position,idx) => {
        const style = { "--x": position.x, "--y": position.y } as CSSProperties;
        return (
          <div
            key={idx}
            style={style}
          />
        );
      })}
    </>;
  }

});

export const renderer : RendererDefs.Renderer = {
  name: "DIV Absolute",
  willInstall: cssSupports(
    [ "display", "block" ],
    [ "top", "calc( 100% / 8 * 1 )" ]
  ),
  view: View,
  menu: Menu
};