/* eslint-disable react-refresh/only-export-components */
import { FC, memo, CSSProperties } from "react";
import { Renderer, RendererFC, Bits } from "../utils/types";
import { ArrayUtils, indexToXY, cssSupports, minifyCss } from "../utils/utils";
import { DivAbsoluteMenu as Menu } from "../renderer_utils/MenuOptions";

const View: RendererFC = (props) => (
  <div className="view">
    <StaticStyle />
    <OptionsDependentStyle
      minimized={props.divAbsoluteMinimized}
      useNthOfType={props.useNthOfType}
      side={props.side}
    />
    <Cells
      minimized={props.divAbsoluteMinimized}
      useNthOfType={props.useNthOfType}
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
  useNthOfType: boolean;
  side: number;
};

const OptionsDependentStyle: FC<OptionsDependentStyleProps> = memo(({ minimized, useNthOfType, side }) => {

  let src = `
    .view {
      --side: ${side};
    }
  `;

  if (!minimized) {
    src += `
      .view > .on {
        background-color: var(--on-color);
      }
      .view > .off {
        background-color: var(--off-color);
      }
    `;

    if (useNthOfType) {
      src += Array.from({ length: side })
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
      }).join("");
    }
  }

  return <style>{src}</style>;
});

type CellsProps = {
  minimized: boolean;
  useNthOfType: boolean;
  side: number;
  bits: Bits;
};

const Cells: FC<CellsProps> = memo((props) => {
  const { minimized, useNthOfType } = props;

  if (!minimized) {

    if (useNthOfType) {
      return <>{props.bits.map((value,idx) => (
        <div key={idx} className={value ? "on" : "off"} />
      ))}</>;
    }

    else {
      return <>{props.bits.map((value,idx) => {
        const { x, y } = indexToXY(idx, props.side);
        const style = { "--x": x, "--y": y } as CSSProperties;
        return (
          <div
            key={idx}
            className={value ? "on" : "off"}
            style={style}
          />
        );
      })}</>;
    }

  }

  else {

    const { bits, side } = props;
    const { majority, minors } = ArrayUtils.minimize(bits, side);

    const colorRules = `
      .view {
        background-color: var(--${ majority ? "on" : "off" }-color);
      }
      .view > div {
        background-color: var(--${ majority ? "off" : "on" }-color);
      }
    `;

    if (useNthOfType) {
      const positionRules = minors.map((position, idx) => `
        .view > div:nth-of-type(${idx+1}) {
          --x: ${position.x};
          --y: ${position.y};
        }
      `).join("");

      const styleSrc = minifyCss( colorRules + positionRules );
      const style = <style>{styleSrc}</style>;

      return <>
        {style}
        {minors.map((_,idx) => (
          <div key={idx} />
        ))}
      </>;
    }

    else {
      const styleSrc = minifyCss(colorRules);
      const style = <style>{styleSrc}</style>;

      return <>
        {style}
        {minors.map((position,idx) => {
          const style = {
            "--x": position.x,
            "--y": position.y
          } as CSSProperties;
          return (
            <div key={idx} style={style} />
          );
        })}
      </>;
    }

  }

});

export const renderer: Renderer = {
  name: "DIV Absolute",
  isActive: cssSupports(
    [ "display", "block" ],
    [ "top", "calc( 100% / 8 * 1 )" ]
  ),
  view: View,
  menu: Menu
};