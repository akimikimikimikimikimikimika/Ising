/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react-refresh/only-export-components */
import { FC, memo, useEffect } from "react";
import { Renderer, RendererFC, Bits } from "../utils/types";
import { cssSupports, minifyCss } from "../utils/utils";

export declare class CSS {
  static paintWorklet: Worklet;
}

const View: RendererFC = (props) => {
  useEffect(() => {
    CSS.paintWorklet.addModule("assets/paintWorklet.js")
    .catch(() => {
      props.notifyFailure("Failed to add Paint Worklet");
    });
  }, [props.notifyFailure]);

  return (
    <div className="view">
      <StaticStyle />
      <DynamicStyle
        side={props.side}
        bits={props.bits}
      />
    </div>
  )
};

const StaticStyle: FC = memo(() => {
  const src = minifyCss(`
    .view {
      background-image: paint(scene);
    }
  `);

  return <style>{src}</style>;
});

type DynamicStyleProps = {
  side: number;
  bits: Bits;
};

const DynamicStyle: FC<DynamicStyleProps> = memo((props) => {
  const { bits, side } = props;

  const bitsString =
    bits.map(value => value ? "1" : "0").join("");

  const src = minifyCss(`
    .view {
      --binary-data: "${bitsString}";
      --side: ${side};
    }
  `);

  return <style>{src}</style>;
});

export const renderer: Renderer = {
  name: "DIV CSS Painting",
  isActive: (
    ("paintWorklet" in CSS) &&
    cssSupports( [ "background-image", "paint(scene)" ] )
  ),
  view: View
};