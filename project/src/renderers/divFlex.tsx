/* eslint-disable react-refresh/only-export-components */
import { FC, memo } from "react";
import { DivFlexMenu as Menu } from "./MenuOptions";
import { Bits, RendererDefs } from "../utils/types";
import { ArrayUtils, cssSupports, minifyCss } from "../utils/utils";

export const ModeConsts = {
  VerticalHorizontal: "vertical-horizontal",
  HorizontalVertical: "horizontal-vertical",
} as const;
export type Mode = Literal<typeof ModeConsts>;

const View: FC<RendererDefs.RendererProps> = (props) => (
  <div className="view">
    <StaticStyle />
    <ModeDependentStyle mode={props.divFlexMode} />
    <Cells mode={props.divFlexMode} bits={props.bits} />
  </div>
);

const StaticStyle: FC = memo(() => {
  const src = minifyCss(`
    .view, .view > div {
      display: flex;
      align-items: stretch;
    }
    .view div {
      flex: 1;
    }
    .on {
      background-color: var(--on-color);
    }
    .off {
      background-color: var(--off-color);
    }
  `);

  return <style>{src}</style>;
});

type ModeDependentStyleProps = {
  mode: Mode;
};

const ModeDependentStyle: FC<ModeDependentStyleProps> = memo(({ mode }) => {
  const src = minifyCss((() => {
    switch (mode) {
      case "vertical-horizontal":
        return `
          .view {
            flex-direction: column;
          }
          .view > div {
            flex-direction: row;
          }
        `;
      case "horizontal-vertical":
        return `
          .view {
            flex-direction: row;
          }
          .view > div {
            flex-direction: column;
          }
        `;
    }
  })());

  return <style>{src}</style>;
});

type CellsProps = {
  mode: Mode;
  bits: Bits;
};

const Cells: FC<CellsProps> = (props) => {
  const bitsNested = (() => {
    switch (props.mode) {
      case "vertical-horizontal":
        return ArrayUtils.nested(props.bits);
      case "horizontal-vertical":
        return ArrayUtils.nested(ArrayUtils.transpose(props.bits));
    }
  })();

  return <>
    {bitsNested.map((bits,idx) => (
      <div key={idx}>
        {bits.map((value,idx) => (
          <div key={idx} className={value ? "on" : "off"} />
        ))}
      </div>
    ))}
  </>;
};

export const renderer : RendererDefs.Renderer = {
  name: "DIV Flex",
  isActive: cssSupports(
    [ "display", "flex" ],
    [ "flex-direction", "column" ],
    [ "flex-direction", "row" ],
    [ "flex", "1" ],
    [ "align-items", "stretch" ]
  ),
  view: View,
  menu: Menu
};