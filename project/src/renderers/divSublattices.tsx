/* eslint-disable react-refresh/only-export-components */
import { FC, memo, useMemo, CSSProperties, useCallback } from "react";
import { DivSublatticesMenu as Menu } from "./MenuOptions";
import { Bits, RendererDefs } from "../utils/types";
import { cssSupports, minifyCss } from "../utils/utils";

export const ModeConsts = {
  Border: "border",
  ConicGradient: "conic-gradient",
} as const;
export type Mode = Literal<typeof ModeConsts>;

export const AngleConsts = {
  A: "45deg", B: "135deg", C: "225deg", D: "315deg",
} as const;
export type Angle = Literal<typeof AngleConsts>;

const View: FC<RendererDefs.RendererProps> = (props) => (
  <div className="view">
    <StaticStyle />
    <SizeDependentStyle side={props.side} />
    <ModeDependentStyle mode={props.divSublatticesMode} />
    <AngleDependentStyle angle={props.divSublatticesAngle} />
    <Cells side={props.side} bits={props.bits} />
  </div>
);

const StaticStyle: FC = memo(() => {
  const src = minifyCss(`
    .view {
      container-type: size;
      overflow: hidden;
    }
    .view > div {
      position: absolute;
      display: block;
      --center-x: calc( 100cqmin / var(--side) * var(--x) );
      --center-y: calc( 100cqmin / var(--side) * var(--y) );
      --radius: calc( 100cqmin / sqrt(2) / var(--side) );
      transform: rotate(var(--angle));
      transform-origin: center center;
    }
  `);

  return <style>{src}</style>;
});

type SizeDependentStyleProps = {
  side: number;
};

const SizeDependentStyle: FC<SizeDependentStyleProps> = memo(({ side }) => {

  type Rule = {
    constraints: Constraint[];
    key: "x" | "y";
    value: number;
  };

  type Constraint = {
    // magnifier * n + constant
    magnifier: number;
    constant: number;
  };

  const rules: Rule[] = (() => {

    if ( side % 2 === 0 ) {
      const k = side / 2;

      const a1 = Array.from({ length: k+1 }).map((_,idx) => [
        {
          key: "x",
          value: 2 * idx,
          constraints: [
            {
              magnifier: k + 1,
              constant: idx + 1
            },
            {
              magnifier: -( k + 1 ),
              constant: idx + 1 + (k+1) * k
            }
          ]
        },
        {
          key: "y",
          value: 2*idx,
          constraints: [
            {
              magnifier: 1,
              constant: (k+1) * idx + 1
            },
            {
              magnifier: -1,
              constant: (k+1) * (idx+1)
            }
          ]
        }
      ] as Rule[]);

      const a2 = Array.from({ length: k }).map((_,idx) => [
        {
          key: "x",
          value: 2 * idx + 1,
          constraints: [
            {
              magnifier: k,
              constant: idx + 1 + (k+1)**2
            },
            {
              magnifier: -k,
              constant: idx + k*(k-1) + 1 + (k+1)**2
            }
          ]
        },
        {
          key: "y",
          value: 2 * idx + 1,
          constraints: [
            {
              magnifier: 1,
              constant: k*idx + 1 + (k+1)**2
            },
            {
              magnifier: -1,
              constant: k*(idx+1) + (k+1)**2
            }
          ]
        }
      ] as Rule[]);

      return [ ...a1, ...a2 ].flat();
    }

    if ( side % 2 === 1 ) {
      const k = ( side + 1 ) / 2;

      return Array.from({ length: k })
      .map((_,idx) => [
        {
          key: "x",
          value: 2 * idx,
          constraints: [
            {
              magnifier: k,
              constant: idx + 1
            },
            {
              magnifier: -k,
              constant: idx + k*(k-1) + 1
            }
          ]
        },
        {
          key: "y",
          value: 2 * idx,
          constraints: [
            {
              magnifier: 1,
              constant: k * idx + 1
            },
            {
              magnifier: -1,
              constant: k * (idx+1)
            }
          ]
        },
        {
          key: "x",
          value: 2 * idx + 1,
          constraints: [
            {
              magnifier: k,
              constant: idx + 1 + k**2
            },
            {
              magnifier: -k,
              constant: idx + k * (k-1) + 1 + k**2
            }
          ]
        },
        {
          key: "y",
          value: 2 * idx + 1,
          constraints: [
            {
              magnifier: 1,
              constant: k * idx + 1 + k**2
            },
            {
              magnifier: -1,
              constant: k * (idx+1) + k**2
            }
          ]
        }
      ] as Rule[]).flat();
    }

    return [];
  })();

  const rulesStr =
    rules.map(rule => {

      const constraintsStr =
      rule.constraints
      .map(({ magnifier, constant }) => {
        const constStr =
          constant>0 ? ` + ${constant}` : ` - ${-constant}`;

        return `:nth-of-type(${magnifier}n${constStr})`;
      }).join("");

      return `
        .view > div${constraintsStr} {
          --${rule.key}: ${rule.value};
        }
      `;

    }).join("\n");

  const src = minifyCss(`
    .view {
      --side: ${side};
    }
    ${rulesStr}
  `);

  return <style>{src}</style>;
});

type ModeDependentStyleProps = {
  mode: Mode;
};

const ModeDependentStyle: FC<ModeDependentStyleProps> = memo(({ mode }) => {

  if ( mode === "border" ) {
    const src = minifyCss(`
      .view > div {
        left: calc( var(--center-x) - var(--radius) );
        top: calc( var(--center-y) - var(--radius) );
        width: 0;
        height: 0;
        border-style: solid;
        border-width: var(--radius);
        border-top-color: var(--top-color);
        border-bottom-color: var(--bottom-color);
        border-left-color: var(--left-color);
        border-right-color: var(--right-color);
      }
    `);

    return <style>{src}</style>;
  }

  if ( mode === "conic-gradient" ) {
    const src = minifyCss(`
      .view > div {
        left: calc( var(--center-x) - var(--radius) );
        right: calc( 100cqmin - var(--center-x) - var(--radius) );
        top: calc( var(--center-y) - var(--radius) );
        bottom: calc( 100cqmin - var(--center-y) - var(--radius) );
        background-image: conic-gradient(from -45deg at 50% 50%, var(--top-color) 0deg 90deg, var(--right-color) 90deg 180deg, var(--bottom-color) 180deg 270deg, var(--left-color) 270deg 360deg);
        background-size: 100% 100%;
        background-repeat: no-repeat;
      }
    `);

    return <style>{src}</style>;
  }

});

type AngleDependentStyleProps = {
  angle: Angle;
};

const AngleDependentStyle: FC<AngleDependentStyleProps> = memo(({ angle }) => {

  const keys = [ "--top-color", "--right-color", "--bottom-color", "--left-color" ];
  const values = [ "--rt", "--rb", "--lb", "--lt" ];
  const angleToOffset: { [key in Angle]: number } = {
    "45deg" : 0,
    "135deg": 1,
    "225deg": 2,
    "315deg": 3
  };

  const colorProps =
    keys.map((key,idx) => {
      const offsetedIndex = ( idx + angleToOffset[angle] ) % 4;
      const value = values[offsetedIndex];
      return `${key}: var(${value});`;
    }).join("\n");

  const src = minifyCss(`
    .view > div {
      --angle: ${angle};
      ${colorProps}
    }
  `);

  return <style>{src}</style>;
});

type CellsProps = {
  side: number;
  bits: Bits;
};

const Cells: FC<CellsProps> = memo((props) => {
  const { side, bits } = props;

  const cells = useMemo(
    () => getCellList(side),
    [side]
  );

  const normalizeCoord = useCallback(
    (coord: number) => Math.min( Math.max( coord, 0 ), side-1 ),
    [side]
  );

  const getValue =
    (coord:Coord) => {
      const x = normalizeCoord(coord.x);
      const y = normalizeCoord(coord.y);
      const value = bits[ x + y * side ];

      return value ? "var(--on-color)" : "var(--off-color)";
    };

  return <>{cells.map((cell,idx) => {
    const style = {
      "--lt": getValue(cell.leftTop),
      "--rt": getValue(cell.rightTop),
      "--lb": getValue(cell.leftBottom),
      "--rb": getValue(cell.rightBottom),
    } as CSSProperties;

    return <div key={idx} style={style} />;
  })}</>;

});

type Cell = {
  leftTop: Coord;
  rightTop: Coord;
  leftBottom: Coord;
  rightBottom: Coord;
};
type Coord = { x: number, y: number };

const getCellList = (side: number): Cell[] => {

  if ( side % 2 === 0 ) {
    const k = side / 2;

    const a1 = Array.from({ length: (k+1)**2 }).map((_,idx) => {
      const x = idx % (k+1);
      const y = Math.floor( idx / (k+1) );

      return {
        leftTop:     { x: 2*x - 1, y: 2*y - 1 },
        rightTop:    { x: 2*x    , y: 2*y - 1 },
        leftBottom:  { x: 2*x - 1, y: 2*y     },
        rightBottom: { x: 2*x    , y: 2*y     }
      } as Cell;
    });

    const a2 = Array.from({ length: k**2 }).map((_,idx) => {
      const x = idx % k;
      const y = Math.floor( idx / k );

      return {
        leftTop:     { x: 2*x    , y: 2*y     },
        rightTop:    { x: 2*x + 1, y: 2*y     },
        leftBottom:  { x: 2*x    , y: 2*y + 1 },
        rightBottom: { x: 2*x + 1, y: 2*y + 1 }
      } as Cell;
    });

    return [ ...a1, ...a2 ];
  }

  if ( side % 2 === 1 ) {
    const k = ( side + 1 ) / 2;

    const a1 = Array.from({ length: k**2 }).map((_,idx) => {
      const x = idx % k;
      const y = Math.floor( idx / k );

      return {
        leftTop:     { x: 2*x - 1, y: 2*y - 1 },
        rightTop:    { x: 2*x    , y: 2*y - 1 },
        leftBottom:  { x: 2*x - 1, y: 2*y     },
        rightBottom: { x: 2*x    , y: 2*y     }
      } as Cell;
    });

    const a2 = Array.from({ length: k**2 }).map((_,idx) => {
      const x = idx % k;
      const y = Math.floor( idx / k );

      return {
        leftTop:     { x: 2*x    , y: 2*y     },
        rightTop:    { x: 2*x + 1, y: 2*y     },
        leftBottom:  { x: 2*x    , y: 2*y + 1 },
        rightBottom: { x: 2*x + 1, y: 2*y + 1 }
      } as Cell;
    });

    return [ ...a1, ...a2 ];
  }

  return [];
};

export const renderer : RendererDefs.Renderer = {
  name: "DIV Sublattices",
  willInstall: cssSupports(
    [ "container-type", "size" ],
    [ "border", "solid red calc( 100cqmin / sqrt(2) / 8 )" ],
    [ "background-image", "conic-gradient(from -45deg, red 0deg 180deg, green 180deg 360deg)" ]
  ),
  view: View,
  menu: Menu
};