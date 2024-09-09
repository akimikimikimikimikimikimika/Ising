/* eslint-disable react-refresh/only-export-components */
import { FC, memo } from "react";
import { DivClipPathPolygonMenu as Menu } from "./MenuOptions";
import { Bits, RendererDefs } from "../utils/types";
import { ArrayUtils, cssSupports, minifyCss } from "../utils/utils";

const View: FC<RendererDefs.RendererProps> = (props) => (
  <div className="view">
    <ModeDependentStyle minimized={props.divClipPathPolygonMinimized} />
    <DynamicStyle
      minimized={props.divClipPathPolygonMinimized}
      side={props.side}
      bits={props.bits}
    />
  </div>
);

type ModeDependentStyleProps = {
  minimized: boolean;
};

const ModeDependentStyle: FC<ModeDependentStyleProps> = memo((props) => {

  if (!props.minimized) {
    const src = minifyCss(`
      .view::before, .view::after {
        content: "";
        position: absolute;
        width: 100%;
        height: 100%;
      }
      .view::before {
        background-color: var(--on-color);
      }
      .view::after {
        background-color: var(--off-color);
      }
    `);

    return <style>{src}</style>;
  }

  else {
    const src = minifyCss(`
      .view::before {
        content: "";
        position: absolute;
        width: 100%;
        height: 100%;
      }
    `);

    return <style>{src}</style>;
  }

});

type DynamicStyleProps = {
  minimized: boolean;
  side: number;
  bits: Bits;
};

const DynamicStyle: FC<DynamicStyleProps> = memo((props) => {
  const { bits, side } = props;

  if (!props.minimized) {
    const { on, off } = ArrayUtils.getPolygonPoints(bits, side, false);

    const [ onPointsStr, offPointsStr ] =
      [ on, off ].map( points => (
        points.map(
          ({ x, y }) => `calc( 100% / ${side} * ${x} ) calc( 100% / ${side} * ${y} )`
        ).join(", ")
      ));

    const src = minifyCss(`
      .view::before {
        clip-path: polygon(${onPointsStr});
      }
      .view::after {
        clip-path: polygon(${offPointsStr});
      }
    `);

    return <style>{src}</style>;
  }

  else {
    const { points, majority } = ArrayUtils.getPolygonPoints(bits, side, true)
    const minorPointsStr =
      points.map(
        ({ x, y }) => `calc( 100% / ${side} * ${x} ) calc( 100% / ${side} * ${y} )`
      ).join(", ");

    const src = minifyCss(`
      .view::before {
        clip-path: polygon(${minorPointsStr});
        background-color: ${ majority ? "var(--off-color)" : "var(--on-color)" };
      }
      .view {
        background-color: ${ majority ? "var(--on-color)" : "var(--off-color)" };
      }
    `);

    return <style>{src}</style>;
  }

});

export const renderer : RendererDefs.Renderer = {
  name: "DIV ClipPath Polygon",
  willInstall: cssSupports(
    [ "clip-path", "polygon( 10% 10%, 10% 30%, 30% 10% )" ]
  ),
  view: View,
  menu: Menu
};