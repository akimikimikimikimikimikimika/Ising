/* eslint-disable react-refresh/only-export-components */
import { FC, memo } from "react";
import { DivGradientMenu as Menu } from "./MenuOptions";
import { RendererDefs, Bits } from "../utils/types";
import { ArrayUtils, cssSupports, minifyCss } from "../utils/utils";

export const ModeConsts = {
  LinearHorizontal: "linear-horizontal",
  LinearVertical: "linear-vertical",
  Conic: "conic",
} as const;
export type Mode = Literal<typeof ModeConsts>;

const View: FC<RendererDefs.RendererProps> = (props) => (
  <div className="view">
    <StaticStyle />
    <OptionsDependentStyle
      side={props.side}
      mode={props.divGradientMode}
      overlap={props.overlap}
      adaptDevicePixelRatio={props.adaptDevicePixelRatio}
    />
    <DynamicStyle
      bits={props.bits}
      side={props.side}
      mode={props.divGradientMode}
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
    }
  `);

  return <style>{src}</style>;
});

type OptionsDependentStyleProps = {
  side: number;
  mode: Mode;
  overlap: number;
  adaptDevicePixelRatio: boolean;
};

const OptionsDependentStyle: FC<OptionsDependentStyleProps> = memo((props) => {
  type Size = { x: string, y: string };

  const size: Size = (() => {
    if ( props.mode === "conic" ) {
      const size = `calc( 100% / ${props.side} * ${2+props.overlap} )`;
      return { x: size, y: size }
    }
    else {
      const thinSize = `calc( 100% / ${props.side} * ${1+props.overlap} )`;
      const thickSize = "100%";
      if ( props.mode === "linear-horizontal" )
        return { x: thickSize, y: thinSize };
      if ( props.mode === "linear-vertical" )
        return { x: thinSize, y: thickSize };

      // unreachable
      return { x: "", y: "" };
    }
  })();

  const devicePixelRatio =
    props.adaptDevicePixelRatio ? window.devicePixelRatio : 1;

  const src = minifyCss(`
    .view {
      background-size: ${size.x} ${size.y};
      --device-pixel-ratio: ${devicePixelRatio};
    }
  `);

  return <style>{src}</style>;
});

type DynamicStyleProps = {
  bits: Bits;
  side: number;
  mode: Mode;
  overlap: number;
};

const DynamicStyle: FC<DynamicStyleProps> = memo((props) => {
  const { bits, mode, side, overlap } = props;

  type Image = {
    image: string;
    positionX: string;
    positionY: string;
  };

  const images: Image[] = (() => {

    if (mode === "conic") {

      const latticeSide = side % 2 === 0 ? side/2 : (side+1)/2;
      const getValue = (x: number, y: number) => bits[x+y*side];
      const denom = side - 2 - overlap;
      const center_xy = `calc( 100% / ${2+overlap} )`;

      return Array.from({ length: latticeSide**2 })
      .map((_,idx) => {
        const x = idx % latticeSide;
        const y = Math.floor( idx / latticeSide );

        const leftTop     = getValue( 2*x        ,  2*y         );
        const rightTop    = getValue((2*x+1)%side,  2*y         );
        const leftBottom  = getValue( 2*x        , (2*y+1)%side );
        const rightBottom = getValue((2*x+1)%side, (2*y+1)%side );

        const stops = ArrayUtils.makeStops([ rightTop, rightBottom, leftBottom, leftTop ]);

        const strStops = stops.map((stop) => {
          const color = stop.value ? "var(--on-color)" : "var(--off-color)";
          const begin = `${stop.begin*90}deg`;
          const end   = `${stop.end*90}deg`;
          return `${color} ${begin} ${end}`;
        });

        return {
          image: `conic-gradient(at ${center_xy} ${center_xy}, ${strStops.join(", ")})`,
          positionX: `calc( 100% / ${denom} * ${2*x} )`,
          positionY: `calc( 100% / ${denom} * ${2*y} )`
        };
      }).reverse();

    }

    // linear
    else {
      const bitsNested = ((mode) => {
        switch (mode) {
          case "linear-horizontal":
            return ArrayUtils.nested(props.bits);
          case "linear-vertical":
            return ArrayUtils.nested(ArrayUtils.transpose(props.bits));
        }
      })(mode);
      const side = props.side;

      const denom = side - 1 - overlap;
      const direction = ((mode) => {
        switch (mode) {
          case "linear-horizontal": return "to right";
          case "linear-vertical":   return "to bottom";
        }
      })(mode);

      return bitsNested.map((bits,i) => {
        const adjusted = i - overlap;
        const position = `calc( 100% / ${denom} * ${adjusted} )`;

        const stops = ArrayUtils.makeStops(bits);

        const strStops = stops.map((stop) => {
          const color = stop.value ? "var(--on-color)" : "var(--off-color)";
          const begin = `calc( 100% / ${side} * ${stop.begin} )`;
          const end   = `calc( 100% / ${side} * ${stop.end} )`;
          return `${color} ${begin} ${end}`;
        });

        const image = `linear-gradient(${direction}, ${strStops.join(", ")})`;

        switch (mode) {
          case "linear-horizontal":
            return { image, positionX: "center", positionY: position };
          case "linear-vertical":
            return { image, positionX: position, positionY: "center" };
        }
      });
    }

  })();

  const image = images.map(i => i.image).join(", ");
  const positionX = images.map(i => i.positionX).join(", ");
  const positionY = images.map(i => i.positionY).join(", ");

  const src = minifyCss(`
    .view {
      background-image: ${image};
      background-position-x: ${positionX};
      background-position-y: ${positionY};
    }
  `);

  return <style>{src}</style>;
});

export const renderer : RendererDefs.Renderer = {
  name: "DIV Gradient",
  willInstall: cssSupports(
    [ "background-size", "calc( 100% / 100 )" ],
    [ "background-image", "linear-gradient(to right, red 0% 50%, green 50% 100%)" ],
    [ "background-image", "linear-gradient(to bottom, red 0% 50%, green 50% 100%)" ],
    [ "background-image", "conic-gradient(at 50% 50%, red 0deg 180deg, green 180deg 360deg)" ],
  ),
  view: View,
  menu: Menu
};