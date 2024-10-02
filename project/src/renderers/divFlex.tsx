/* eslint-disable react-refresh/only-export-components */
import { FC, memo, useMemo } from "react";
import { Renderer, RendererFC, Bits } from "../utils/types";
import { ArrayUtils, cssSupports, minifyCss } from "../utils/utils";
import { DivFlexMode as Mode } from "../renderer_utils/types";
import { DivFlexMenu as Menu } from "../renderer_utils/MenuOptions";

const View: RendererFC = (props) => (
  <div className="view">
    <StaticStyle />
    <ModeDependentStyle
      mode={props.divFlexMode}
      outerReversed={props.divFlexOuterReversed}
      innerReversed={props.divFlexInnerReversed}
      />
    <Cells
      mode={props.divFlexMode}
      outerReversed={props.divFlexOuterReversed}
      innerReversed={props.divFlexInnerReversed}
      bits={props.bits}
    />
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
  mode: Mode.Type;
  outerReversed: boolean;
  innerReversed: boolean;
};

const ModeDependentStyle: FC<ModeDependentStyleProps> = memo((props) => {
  let [outer, inner] = (() => {
    switch (props.mode) {
      case Mode.VerticalHorizontal:
        return ["column", "row"];
      case Mode.HorizontalVertical:
        return ["row", "column"];
    }
  })();

  if (props.outerReversed) outer += "-reverse";
  if (props.innerReversed) inner += "-reverse";

  const src = minifyCss(`
    .view {
      flex-direction: ${outer};
    }
    .view > div {
      flex-direction: ${inner};
    }
  `);

  return <style>{src}</style>;
});

type CellsProps = {
  mode: Mode.Type;
  outerReversed: boolean;
  innerReversed: boolean;
  bits: Bits;
};

const { identity, transpose, flipX, flipY } = ArrayUtils.processors;

const Cells: FC<CellsProps> = (props) => {
  const processor = useMemo(() => {
    const processes: ArrayUtils.Process[] = [];

    if (props.outerReversed) processes.push(flipY);
    if (props.innerReversed) processes.push(flipX);
    processes.push( (() => {
      switch (props.mode) {
        case Mode.VerticalHorizontal:
          return identity;
        case Mode.HorizontalVertical:
          return transpose;
      }
    })() );

    return ArrayUtils.multiplyProcess(...processes);
  }, [props.mode, props.outerReversed, props.innerReversed]);

  const bitsNested = ArrayUtils.nested(ArrayUtils.performProcess(props.bits, processor));

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

export const renderer: Renderer = {
  name: "DIV Flex",
  isActive: cssSupports(
    [ "display", "flex" ],
    [ "flex-direction", "column" ],
    [ "flex-direction", "row" ],
    [ "flex-direction", "column-reverse" ],
    [ "flex-direction", "row-reverse" ],
    [ "flex", "1" ],
    [ "align-items", "stretch" ]
  ),
  view: View,
  menu: Menu
};