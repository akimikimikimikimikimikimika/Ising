/* eslint-disable react-refresh/only-export-components */
/* eslint-disable @typescript-eslint/no-namespace */
import { FC, memo, useMemo, CSSProperties } from "react";
import { Renderer, RendererFC, Bits, XY } from "../utils/types";
import { indexToXY, cssSupports, minifyCss } from "../utils/utils";
import {
  DivSublatticesDrawMode   as DrawMode,
  DivSublatticesRotateMode as RotateMode,
  DivSublatticesLayout     as Layout,
  DivSublatticesAngle      as Angle
} from "../renderer_utils/types";
import { DivSublatticesMenu as Menu } from "../renderer_utils/MenuOptions";

const View: RendererFC = (props) => (
  <div className="view">
    <StaticStyle />
    <SizeLayoutDependentStyle
      side={props.side}
      layout={props.divSublatticeLayout}
      useNthOfType={props.useNthOfType}
    />
    <DrawModeDependentStyle drawMode={props.divSublatticesDrawMode} />
    <RotateModeDependentStyle rotateMode={props.divSublatticeRotateMode} />
    <AngleDependentStyle angle={props.divSublatticesAngle} />
    <Cells
      side={props.side} bits={props.bits}
      layout={props.divSublatticeLayout}
      useNthOfType={props.useNthOfType}
    />
  </div>
);

namespace subComponents {

  export const StaticStyle: FC = memo(() => {
    const src = minifyCss(`
      .view {
        container-type: size;
        overflow: hidden;
      }
      .view > div {
        position: absolute;
        left: 0; top: 0;
        width: 0; height: 0;
        overflow: visible;
      }
      .view > div > div {
        position: absolute;
        display: block;
        --radius: calc( 100cqmin / sqrt(2) / var(--side) );
      }
    `);

    return <style>{src}</style>;
  });

  type SizeLayoutDependentStyleProps = {
    side: number;
    layout: Layout.Type;
    useNthOfType: boolean;
  };

  export const SizeLayoutDependentStyle: FC<SizeLayoutDependentStyleProps> = memo((props) => {
    const { side, layout, useNthOfType } = props;

    const src = minifyCss(`
      .view {
        --side: ${side};
      }
      ${useNthOfType ? nthRules.get(side, layout) : ""}
    `);

    return <style>{src}</style>;
  });

  type DrawModeDependentStyleProps = {
    drawMode: DrawMode.Type;
  };

  export const DrawModeDependentStyle: FC<DrawModeDependentStyleProps> = memo(({ drawMode }) => {
    switch (drawMode) {
      case DrawMode.Border: {
        const src = minifyCss(`
          .view > div > div {
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
      case DrawMode.ConicGradient: {
        const src = minifyCss(`
          .view > div > div {
            left: calc( var(--center-x) - var(--radius) );
            top: calc( var(--center-y) - var(--radius) );
            width: calc( 2 * var(--radius) );
            height: calc( 2 * var(--radius) );
            background-image: conic-gradient(from -45deg at 50% 50%, var(--top-color) 0deg 90deg, var(--right-color) 90deg 180deg, var(--bottom-color) 180deg 270deg, var(--left-color) 270deg 360deg);
            background-size: 100% 100%;
            background-repeat: no-repeat;
          }
        `);
        return <style>{src}</style>;
      }
    }
  });

  type RotateModeDependentStyleProps = {
    rotateMode: RotateMode.Type;
  };

  export const RotateModeDependentStyle: FC<RotateModeDependentStyleProps> = memo(({ rotateMode }) => {
    switch (rotateMode) {
      case RotateMode.PerCells: {
        const src = minifyCss(`
          .view > div > div {
            --center-x: calc( 100cqmin / var(--side) * var(--x) );
            --center-y: calc( 100cqmin / var(--side) * var(--y) );
            transform: rotate(var(--angle));
            transform-origin: center center;
          }
        `);
        return <style>{src}</style>;
      }
      case RotateMode.WholeLattice: {
        const src = minifyCss(`
          .view > div {
            transform: rotate(var(--angle));
            transform-origin: 0 0;
          }
          .view > div > div {
            --center-x: calc( 100cqmin / var(--side) / sqrt(2) * var(--s) );
            --center-y: calc( 100cqmin / var(--side) / sqrt(2) * var(--t) );
          }
        `);
        return <style>{src}</style>;
      }
    }
  });

  type AngleConversion = {
    [key in Angle.Type]: {
      offset: number;
      transformMatrix: {
        sx: number, sy: number,
        tx: number, ty: number
      };
    }
  };
  const angleConversion: AngleConversion = {
    [Angle.deg45]: {
      offset: 0,
      transformMatrix: { sx: +1, sy: +1, tx: -1, ty: +1 }
    },
    [Angle.deg135]: {
      offset: 1,
      transformMatrix: { sx: -1, sy: +1, tx: -1, ty: -1 }
    },
    [Angle.deg225]: {
      offset: 2,
      transformMatrix: { sx: -1, sy: -1, tx: +1, ty: -1 }
    },
    [Angle.deg315]: {
      offset: 3,
      transformMatrix: { sx: +1, sy: -1, tx: +1, ty: +1 }
    }
  };

  const sideColors = [ "--top-color", "--right-color", "--bottom-color", "--left-color" ];
  const corners = [ "--rt", "--rb", "--lb", "--lt" ];

  type AngleDependentStyleProps = {
    angle: Angle.Type;
  };

  export const AngleDependentStyle: FC<AngleDependentStyleProps> = memo(({ angle }) => {

    const converter = angleConversion[angle];

    const colorProps =
      sideColors.map((key,idx) => {
        const offsetedIndex = ( idx + converter.offset ) % 4;
        const value = corners[offsetedIndex];
        return `${key}: var(${value});`;
      }).join("\n");

    const { sx, sy, tx, ty } = converter.transformMatrix;

    const src = minifyCss(`
      .view {
        --angle: ${angle};
      }
      .view > div > div {
        ${colorProps}
        --s: calc( ( ${sx} * var(--x) ) + ( ${sy} * var(--y) ) );
        --t: calc( ( ${tx} * var(--x) ) + ( ${ty} * var(--y) ) );
      }
    `);

    return <style>{src}</style>;
  });

  type CellsProps = {
    side: number;
    bits: Bits;
    layout: Layout.Type;
    useNthOfType: boolean;
  };

  export const Cells: FC<CellsProps> = memo((props) => {
    const { side, bits, layout, useNthOfType } = props;

    const cells = useMemo(
      () => cellList.get(side, layout),
      [side, layout]
    );

    const getValue =
      (coord: cellList.Coord) => {
        const value = bits[ coord.x + coord.y * side ];
        return value ? "var(--on-color)" : "var(--off-color)";
      };

    return <div>{cells.map((cell,idx) => {
      const style = {
        "--lt": getValue(cell.leftTop),
        "--rt": getValue(cell.rightTop),
        "--lb": getValue(cell.leftBottom),
        "--rb": getValue(cell.rightBottom),
        ...(
          useNthOfType ? {} : {
            "--x": cell.position.x,
            "--y": cell.position.y
          }
        )
      } as CSSProperties;

      return <div key={idx} style={style} />;
    })}</div>;

  });

}
const StaticStyle = subComponents.StaticStyle;
const SizeLayoutDependentStyle = subComponents.SizeLayoutDependentStyle;
const DrawModeDependentStyle = subComponents.DrawModeDependentStyle;
const RotateModeDependentStyle = subComponents.RotateModeDependentStyle;
const AngleDependentStyle = subComponents.AngleDependentStyle;
const Cells = subComponents.Cells;

namespace nthRules {

  type XY = "x" | "y";
  type Direction = "+x" | "-x" | "+y" | "-y";

  type Constraint = {
    direction: Direction;
    basis: (coord: number, lengthX: number, lengthY: number) => number;
  };
  type Constraints = {
    axis: XY,
    constraints: [Constraint, Constraint]
  };
  const ruleSelectors = [
    {
      axis: "x",
      constraints: [
        { direction: "+y", basis: (x      ) =>   x           },
        { direction: "-y", basis: (x, l, m) =>   x + l*(m-1) }
      ]
    } as Constraints,
    {
      axis: "y",
      constraints: [
        { direction: "+x", basis: (y, l   ) => l*y           },
        { direction: "-x", basis: (y, l,  ) => l*y +   (l-1) }
      ]
    } as Constraints
  ];

  type Rule = {
    constraints: ({
      multiplier: number;
      constant: number;
    })[];
    variable: string;
    value: number;
  };

  const ruleToStr = (rule: Rule): string => {
    const constraintsStr =
    rule.constraints.map(({ multiplier, constant }) => {
      return `:nth-of-type(${multiplier}n+${constant})`;
    }).join("");

    return `
      .view > div > div${constraintsStr} {
        --${rule.variable}: ${rule.value};
      }
    `;
  };

  type CreateRulesOption = {
    lengthX: number;
    lengthY: number;
    offsetIdx?: number;
    idxToX?: (coordIdx: number) => number;
    idxToY?: (coordIdx: number) => number;
  };

  const createRules = (option: CreateRulesOption): string => {
    const { lengthX: l, lengthY: m } = option;
    const idxToX = option.idxToX ?? ( v => v );
    const idxToY = option.idxToY ?? ( v => v );
    const offsetIdx = option.offsetIdx ?? 0;

    // iterate over axes
    return ruleSelectors.map(({ axis, constraints }) => {
      const length = ({ x: l, y: m })[axis];
      const idxToCoord = ({ x: idxToX, y: idxToY })[axis];

      // iterate over positions along the axis
      return Array.from({ length: length }).map(
        (_, coordIdx) => (
          ruleToStr({
            constraints: constraints.map(
              ({ direction, basis }) => ({
                multiplier: ({ "+x": +1, "-x": -1, "+y": +l, "-y": -l })[direction],
                constant: basis(coordIdx, l, m) + 1 + offsetIdx
              })
            ),
            variable: axis, value: idxToCoord(coordIdx)
          })
        )
      );
    }).flat().join("");
  };

  export const get = (side: number, layout: Layout.Type): string => {
    switch ( side % 2 ) {
      // even
      case 0: {
        const k = side / 2;
        switch (layout) {
          case Layout.One:
            return (
              createRules({
                lengthX: k+1, lengthY: k+1,
                idxToX: idx => 2*idx,
                idxToY: idx => 2*idx
              }) +
              createRules({
                lengthX: k, lengthY: k,
                idxToX: idx => 2*idx + 1,
                idxToY: idx => 2*idx + 1,
                offsetIdx: (k+1)**2
              })
            );
          case Layout.Two:
            return (
              createRules({
                lengthX: k+1, lengthY: k,
                idxToX: idx => 2*idx,
                idxToY: idx => 2*idx + 1
              }) +
              createRules({
                lengthX: k, lengthY: k+1,
                idxToX: idx => 2*idx + 1,
                idxToY: idx => 2*idx,
                offsetIdx: k*(k+1)
              })
            );
        }
      } break;
      // odd
      case 1: {
        const k = ( side + 1 ) / 2;
        switch (layout) {
          case Layout.One:
            return (
              createRules({
                lengthX: k, lengthY: k,
                idxToX: idx => 2*idx,
                idxToY: idx => 2*idx
              }) +
              createRules({
                lengthX: k, lengthY: k,
                idxToX: idx => 2*idx + 1,
                idxToY: idx => 2*idx + 1,
                offsetIdx: k**2
              })
            );
          case Layout.Two:
            return (
              createRules({
                lengthX: k, lengthY: k,
                idxToX: idx => 2*idx,
                idxToY: idx => 2*idx + 1
              }) +
              createRules({
                lengthX: k, lengthY: k,
                idxToX: idx => 2*idx + 1,
                idxToY: idx => 2*idx,
                offsetIdx: k**2
              })
            );
        }
      } break;
    }
    // you should not reach to this line
    return "";
  };

}

namespace cellList {

  type Cell = {
    leftTop: Coord;
    rightTop: Coord;
    leftBottom: Coord;
    rightBottom: Coord;
    position: Coord;
  };
  export type Coord = { x: number, y: number };

  export const get = (side: number, layout: Layout.Type): Cell[] => {

    const coord = (x: number, y: number): Coord => ({
      x: normalizeCoord(x, side),
      y: normalizeCoord(y, side)
    });

    switch ( side % 2 ) {
      // even
      case 0: {
        const k = side / 2;
        switch (layout) {
          case Layout.One:
            return [
              ...perCell(
                k+1, k+1,
                ({ x, y }) => ({
                  leftTop:     coord( 2*x - 1, 2*y - 1 ),
                  rightTop:    coord( 2*x    , 2*y - 1 ),
                  leftBottom:  coord( 2*x - 1, 2*y     ),
                  rightBottom: coord( 2*x    , 2*y     ),
                  position:    { x: 2*x, y: 2*y }
                })
              ),
              ...perCell(
                k, k,
                ({ x, y }) => ({
                  leftTop:     coord( 2*x    , 2*y     ),
                  rightTop:    coord( 2*x + 1, 2*y     ),
                  leftBottom:  coord( 2*x    , 2*y + 1 ),
                  rightBottom: coord( 2*x + 1, 2*y + 1 ),
                  position:    { x: 2*x + 1, y: 2*y + 1 }
                })
              ),
            ];
          case Layout.Two:
            return [
              ...perCell(
                k+1, k,
                ({ x, y }) => ({
                  leftTop:     coord( 2*x - 1, 2*y     ),
                  rightTop:    coord( 2*x    , 2*y     ),
                  leftBottom:  coord( 2*x - 1, 2*y + 1 ),
                  rightBottom: coord( 2*x    , 2*y + 1 ),
                  position:    { x: 2*x, y: 2*y + 1 }
                })
              ),
              ...perCell(
                k, k+1,
                ({ x, y }) => ({
                  leftTop:     coord( 2*x    , 2*y - 1 ),
                  rightTop:    coord( 2*x + 1, 2*y - 1 ),
                  leftBottom:  coord( 2*x    , 2*y     ),
                  rightBottom: coord( 2*x + 1, 2*y     ),
                  position:    { x: 2*x + 1, y: 2*y }
                })
              ),
            ];
        }
      } break;
      // odd
      case 1: {
        const k = ( side + 1 ) / 2;
        switch (layout) {
          case Layout.One:
            return [
              ...perCell(
                k, k,
                ({ x, y }) => ({
                  leftTop:     coord( 2*x - 1, 2*y - 1 ),
                  rightTop:    coord( 2*x    , 2*y - 1 ),
                  leftBottom:  coord( 2*x - 1, 2*y     ),
                  rightBottom: coord( 2*x    , 2*y     ),
                  position:    { x: 2*x, y: 2*y }
                })
              ),
              ...perCell(
                k, k,
                ({ x, y }) => ({
                  leftTop:     coord( 2*x    , 2*y     ),
                  rightTop:    coord( 2*x + 1, 2*y     ),
                  leftBottom:  coord( 2*x    , 2*y + 1 ),
                  rightBottom: coord( 2*x + 1, 2*y + 1 ),
                  position:    { x: 2*x + 1, y: 2*y + 1 }
                })
              )
            ];
          case Layout.Two:
            return [
              ...perCell(
                k, k,
                ({ x, y }) => ({
                  leftTop:     coord( 2*x - 1, 2*y     ),
                  rightTop:    coord( 2*x    , 2*y     ),
                  leftBottom:  coord( 2*x - 1, 2*y + 1 ),
                  rightBottom: coord( 2*x    , 2*y + 1 ),
                  position:    { x: 2*x, y: 2*y + 1 }
                })
              ),
              ...perCell(
                k, k,
                ({ x, y }) => ({
                  leftTop:     coord( 2*x    , 2*y - 1 ),
                  rightTop:    coord( 2*x + 1, 2*y - 1 ),
                  leftBottom:  coord( 2*x    , 2*y     ),
                  rightBottom: coord( 2*x + 1, 2*y     ),
                  position:    { x: 2*x + 1, y: 2*y }
                })
              ),
            ];
        }
      } break;
    }

    // you should not reach to this line
    return [];
  };

  const perCell = (
    lengthX: number, lengthY: number,
    factory: (xy: XY) => Cell
  ): Cell[] => (
    Array.from({ length: lengthX*lengthY })
    .map(
      (_,idx) => factory(
        indexToXY(idx, lengthX)
      )
    )
  );

  const normalizeCoord = (coord: number, side: number) => (
    Math.min( Math.max( coord, 0 ), side-1 )
  );

}

export const renderer: Renderer = {
  name: "DIV Sublattices",
  isActive: cssSupports(
    [ "container-type", "size" ],
    [ "border", "solid red calc( 100cqmin / sqrt(2) / 8 )" ],
    [ "background-image", "conic-gradient(from -45deg, red 0deg 180deg, green 180deg 360deg)" ]
  ),
  view: View,
  menu: Menu
};