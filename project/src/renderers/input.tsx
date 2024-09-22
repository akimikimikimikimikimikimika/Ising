/* eslint-disable react-refresh/only-export-components */
import { FC, memo, useState, useRef, useEffect, CSSProperties } from "react";
import { InputMenu as Menu } from "../renderer_utils/MenuOptions";
import { Bits, RendererDefs } from "../utils/types";
import { minifyCss, cssSupports, Runner } from "../utils/utils";
import { isNil } from "../utils/type_check";

export const TypeConsts = {
  Checkbox: "checkbox",
  Radio: "radio"
} as const;
export type Type = Literal<typeof TypeConsts>;

type WH = RendererDefs.WH;
type XY = { x: number, y: number };

const View: FC<RendererDefs.RendererProps> = (props) => {
  const viewRef = useRef<HTMLDivElement|null>(null);

  const [viewSize, setViewSize] = useState<WH | null>(null);
  const [inputSize, setInputSize] = useState<WH | null>(null);

  const [scale, setScale] = useState<XY | null>(null);

  // type change receiver
  useEffect(() => {
    setInputSize(null);
  }, [props.side, props.inputType]);

  // resize receiver
  useEffect(() => {
    const view = viewRef.current;
    if (isNil(view)) return;
    const bcr = view.getBoundingClientRect();
    if ( bcr.width === 0 || bcr.height === 0 ) return;
    setViewSize({ width: bcr.width, height: bcr.height });
  }, [props.windowSize]);

  // determine scale
  useEffect(() => {
    if ( isNil(viewSize) || isNil(inputSize) ) {
      setScale(null);
      return;
    }

    const cellSize: WH = {
      width:  viewSize.width  / props.side * props.inputSize,
      height: viewSize.height / props.side * props.inputSize
    };
    const scale: XY = {
      x: cellSize.width  / inputSize.width,
      y: cellSize.height / inputSize.height
    };
    setScale(scale);
  }, [props.side, props.inputSize, viewSize, inputSize]);

  return (
    <div className="view" ref={viewRef}>
      <StaticStyle />
      <OptionsDependentStyle
        side={props.side}
        scale={scale}
        relSize={props.inputSize}
      />
      <ReferenceCell
        type={props.inputType}
        isVisible={isNil(scale)}
        setInputSize={setInputSize}
      />
      <Cells
        side={props.side} bits={props.bits}
        type={props.inputType}
        isVisible={!isNil(scale)}
      />
    </div>
  );
};

const StaticStyle: FC = memo(() => {
  const src = minifyCss(`
    .view > input:not(.reference) {
      position: absolute;
      display: block;
      box-sizing: border-box;
      --position-x: calc( var(--x) + ( 1 - var(--rel-size) ) / 2 );
      --position-y: calc( var(--y) + ( 1 - var(--rel-size) ) / 2 );
      left: calc( 100% / var(--side) * var(--position-x) );
      top: calc( 100% / var(--side) * var(--position-y) );
      accent-color: var(--off-color);
      transform: scale(var(--scale-x),var(--scale-y));
      transform-origin: left top;
      margin: 0;
    }
    .view > input.reference {
      opacity: 0;
    }
  `);

  return <style>{src}</style>;
});

type OptionsDependentStyleProps = {
  side: number;
  relSize: number;
  scale: XY | null;
};

const OptionsDependentStyle: FC<OptionsDependentStyleProps> = memo((props) => {
  const src = minifyCss(`
    .view {
      --side: ${props.side};
      --rel-size: ${props.relSize};
      --scale-x: ${props.scale?.x ?? 1};
      --scale-y: ${props.scale?.y ?? 1};
    }
  `);

  return <style>{src}</style>;
});

type CellsProps = {
  side: number;
  bits: Bits;
  type: Type;
  isVisible: boolean;
};

const Cells: FC<CellsProps> = memo((props) => {
  if (!props.isVisible) return <></>;

  return <>{props.bits.map((value, idx) => {
    const x = idx % props.side;
    const y = Math.floor( idx / props.side );

    return (
      <Cell
        key={idx}
        x={x} y={y} value={value}
        type={props.type}
      />
    );
  })}</>;
});

type CellProps = {
  x: number;
  y: number;
  value: boolean;
  type: Type;
};

const Cell: FC<CellProps> = memo((props) => {
  const style = { "--x": props.x, "--y": props.y } as CSSProperties;

  switch (props.type) {
    case "checkbox":
      return (
        <input
          type="checkbox"
          checked={!props.value}
          readOnly
          style={style}
        />
      );
    case "radio":
      return (
        <input
          type="radio"
          checked={!props.value}
          readOnly
          style={style}
        />
      );
    default:
      return <></>;
  }
});

type ReferenceCellProps = {
  type: Type;
  isVisible: boolean;
  setInputSize: StateSetter<WH | null>;
};

const ReferenceCell: FC<ReferenceCellProps> = memo((props) => {
  const inputRef = useRef<HTMLInputElement|null>(null);

  useEffect(
    () => {
      (async () => {
        const input = inputRef.current;
        if ( !props.isVisible || isNil(input) ) return;

        const bcr = input.getBoundingClientRect();
        if ( bcr.width === 0 || bcr.height === 0 ) return;
        await Runner.sleep(0);
        props.setInputSize({ width: bcr.width, height: bcr.height });
      })();
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [props.isVisible, inputRef.current]
  );

  if (!props.isVisible) return <></>;

  switch (props.type) {
    case "checkbox":
      return (
        <input
          className="reference"
          type="checkbox"
          readOnly
          ref={inputRef}
        />
      );
    case "radio":
      return (
        <input
          className="reference"
          type="radio"
          readOnly
          ref={inputRef}
        />
      );
    default:
      return <></>;
  }
});

export const renderer : RendererDefs.Renderer = {
  name: "Input Checkbox / Radio",
  isActive: cssSupports(
    [ "accent-color", "red" ]
  ),
  view: View,
  menu: Menu
};