/* eslint-disable react-refresh/only-export-components */
import { FC, memo, CSSProperties } from "react";
import { DivGridMenu as Menu } from "./MenuOptions";
import { Bits, RendererDefs } from "../utils/types";
import { ArrayUtils, cssSupports, minifyCss } from "../utils/utils";

export const ModeConsts = {
  VerticalHorizontal: "vertical-horizontal",
  HorizontalVertical: "horizontal-vertical",
  Minimized: "minimized",
} as const;
export type Mode = Literal<typeof ModeConsts>;

const View: FC<RendererDefs.RendererProps> = (props) => (
  <div className="view">
    <StaticStyle />
    <ModeDependentStyle mode={props.divGridMode} />
    <SizeDependentStyle side={props.side} />
    <Cells
      side={props.side} bits={props.bits}
      mode={props.divGridMode}
    />
  </div>
);

const StaticStyle: FC = memo(() => {
  const src = minifyCss(`
    .view {
      display: grid;
      grid-template-columns: repeat(var(--side),1fr);
      grid-template-rows: repeat(var(--side),1fr);
    }
  `);

  return <style>{src}</style>;
});

type ModeDependentStyleProps = {
  mode: Mode;
};

const ModeDependentStyle: FC<ModeDependentStyleProps> = memo(({ mode }) => {
  const src = minifyCss((() => {

    if ( mode === "minimized" ) return `
      .view > div {
        grid-column: calc( var(--x) + 1 ) / calc( var(--x) + 2 );
        grid-row: calc( var(--y) + 1 ) / calc( var(--y) + 2 );
      }
    `;

    const flow =
      mode === "vertical-horizontal" ? "row" :
      mode === "horizontal-vertical" ? "column" :
      "";

    return `
      .view {
        grid-auto-flow: ${flow};
      }
      .view > .on {
        background-color: var(--on-color);
      }
      .view > .off {
        background-color: var(--off-color);
      }
    `;

  })());

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

type CellsProps = {
  mode: Mode;
  side: number;
  bits: Bits;
};
const Cells: FC<CellsProps> = memo((props) => {

  if ( props.mode === "minimized" ) {
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

  else {
    const bits =
      props.mode === "vertical-horizontal" ? props.bits :
      props.mode === "horizontal-vertical" ? ArrayUtils.transpose(props.bits) :
      [];

    return <>{bits.map((value,idx) => (
      <div
        key={idx}
        className={value ? "on" : "off"}
      />
    ))}</>;
  }

});

export const renderer : RendererDefs.Renderer = {
  name: "DIV Grid",
  isActive: cssSupports(
    [ "display", "grid" ],
    [ "grid-auto-flow", "row" ],
    [ "grid-auto-flow", "column" ],
    [ "grid-column", "1/2" ],
    [ "grid-row", "1/2" ]
  ),
  view: View,
  menu: Menu
};