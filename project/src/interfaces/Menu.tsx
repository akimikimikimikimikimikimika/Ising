import { FC, useState, useRef, useCallback, useEffect } from "react";
import { Parameters } from "../utils/types";
import { lists as renderers, RenderOptions } from "../renderers/list";
import { isNil } from "../utils/type_check";
import "./Menu.css";


type MenuProps = Parameters & RenderOptions;

export const Menu: FC<MenuProps> = (props) => {

  const rendererOptions = (() => {
    const renderer = renderers.find(renderer => renderer.name === props.current);
    if (isNil(renderer)) return <></>;
    const Options = renderer?.menu;
    return isNil(Options) ? <></> : <>
      <Caption title={`${renderer.name} Option`} />
      <Options {...props} />
    </>;
  })();

  return (
    <div id="menu">
      <Caption title="Parameters" />
      <Range
        name="logT"
        min={-2} max={+2} step={0.5}
        value={props.temp} setValue={props.setTemp}
      />
      <Range
        name="H"
        min={-6} max={+6} step={2}
        value={props.magField} setValue={props.setMagField}
      />
      <Range
        name="J"
        min={-1} max={+1} step={1}
        value={props.interaction} setValue={props.setInteraction}
      />
      <Range
        name="pixels"
        min={2} max={150} step={1}
        value={props.pixels} setValue={props.setPixels}
      />
      <Chooser
        name="RNG"
        mode="segmented"
        options={[
          { label: "Normal", value: "normal" },
          { label: "Crypto", value: "crypto" }
        ]}
        value={props.rng}
        setValue={props.setRng}
      />
      <Caption title="Controls" />
      <Chooser
        name="Updating"
        mode="segmented"
        options={[
          { label: "On", value: true },
          { label: "Off", value: false }
        ]}
        value={props.playing}
        setValue={props.setPlaying}
      />
      <Range
        name="Minimum Updating Interval"
        min={100} max={3000} step={100}
        formatter={value => (
          value % 1000 === 0 ? `${value/1000}.0 sec` : `${value/1000} sec`
        )}
        value={props.interval} setValue={props.setInterval}
      />
      <Caption title="Renderer" />
      <Chooser
        name="Current Renderer"
        mode="selector"
        options={renderers.filter(
          renderer => renderer.willInstall
        ).map( renderer => renderer.name )}
        value={props.current}
        setValue={props.setCurrent}
      />
      {rendererOptions}
    </div>
  );
};



type CaptionProps = {
  title: string;
}

export const Caption: FC<CaptionProps> = (props) => (
  <div className="caption">{props.title}</div>
);



type RangeProps = {
  name: string;
  value: number;
  setValue: StateSetter<number>;
  formatter?: Formatter;
  min?: Nullable<number>;
  max?: Nullable<number>;
  step?: Nullable<number>;
};
type Formatter = (value: number) => string;

export const Range: FC<RangeProps> = (props) => {
  const { name, value, setValue, min, max, step } = props;

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const formatter: Formatter = useCallback(
    props.formatter ?? (value => value.toString()),
    [props.formatter]
  );

  const inputRef = useRef<HTMLInputElement|null>(null);

  const [valueStr, setValueStr] = useState(formatter(value));

  type OnChange = React.PointerEventHandler<HTMLInputElement>;
  const handleChange: OnChange = event => {
    if (isNil(inputRef.current)) return;

    const valueStr = inputRef.current.value;
    const value = parseFloat(valueStr);

    setValue(value);
    setValueStr(formatter(value));

    event.stopPropagation();
  };

  return (
    <label className="range">
      <div className="name">{name}</div>
      <div className="slider">
        <input
          type="range" ref={inputRef}
          min={min ?? undefined}
          max={max ?? undefined}
          step={step ?? undefined}
          defaultValue={value}
          onPointerUp={handleChange}
        />
      </div>
      <div className="value">{valueStr}</div>
    </label>
  )
};



type ChooserProps<T> = {
  name: string;
  mode: "selector" | "segmented";
  options: ({ value: T, label: string } | string)[];
  value?: Nullable<T>;
  setValue: StateSetter<T>;
};

export const Chooser = <T,>(props: ChooserProps<T>) => {
  switch (props.mode) {
    case "selector":
      return <Selector {...props} />;
    case "segmented":
      return <Segmented {...props} />;
  }
};

const Selector = <T,>(props: ChooserProps<T>) => {
  const { name, options, value, setValue } = props;

  const selectRef = useRef<HTMLSelectElement|null>(null);

  const [index, setIndex] = useState<number|undefined>(undefined);
  const [label, setLabel] = useState<string>("");
  useEffect(() => {
    if (isNil(props.value)) {
      setIndex(undefined);
      setLabel("");
      return;
    }
    const found =
      props.options.map((item,idx) => (
        [
          typeof item === "string" ?
          { value: item as T, label: item } :
          item, idx
        ] as [ { value: T, label: string }, number ]
      ))
      .find( ([item,]) => item.value === props.value);
    if (isNil(found)) {
      setIndex(undefined);
      setLabel("");
      return;
    }
    setIndex(found[1]);
    setLabel(found[0].label);
  }, [props.value, props.options]);

  type OnClick = React.MouseEventHandler<HTMLDivElement>;
  const handleOpen: OnClick = (event) => {
    if (!isNil(selectRef.current)) selectRef.current.click();
    event.stopPropagation();
  };

  type OnChange = React.ChangeEventHandler<HTMLSelectElement>;
  const handleChange: OnChange = (event) => {
    if (isNil(selectRef.current)) return;
    const item = props.options[Number(selectRef.current.value)];
    const value = typeof item === "string" ? (item as T) : item.value;
    setValue(value);
    event.stopPropagation();
  };

  return (
    <label className="selector">
      <div className="name">{name}</div>
      <div className="value">
        <select
          ref={selectRef}
          defaultValue={index}
          defaultChecked={!isNil(value)}
          onChange={handleChange}
        >{options.map((item,idx) => {
          const label = typeof item === "string" ? item : item.label;
          return <option key={idx} value={idx}>{label}</option>;
        })}</select>
        <div
          className="button" role="button"
          onClick={handleOpen}
        >
          <div className="label">{label}</div>
        </div>
      </div>
    </label>
  );
};

const Segmented = <T,>(props: ChooserProps<T>) => {
  const { name, options, value, setValue } = props;

  return (
    <div className="segmented">
      <div className="name">{name}</div>
      <div className="value">
        <div className="segment">
          {options.map((item,idx) => {
            const val = typeof item === "string" ? (item as T) : item.value;
            const label = typeof item === "string" ? item : item.label;
            const selected = value === val;

            const onClick = () => {
              setValue(val);
            };

            return (
              <div
                key={idx}
                className={selected ? "selected" : undefined}
                role="button"
                onClick={onClick}
              >{label}</div>
            );
          })}
        </div>
      </div>
    </div>
  )
};



type ButtonProps = {
  label: string;
  title: string;
  checked: boolean;
  disabled?: boolean;
  onClick: () => void;
};

export const Button: FC<ButtonProps> = (props) => {

  let active = false;

  type Handler = React.PointerEventHandler<HTMLDivElement>;
  const handleStart: Handler = event => {
    if (!props.disabled) active = true;
    event.stopPropagation();
  };
  const handleMove: Handler = event => {
    if (active && !props.disabled) active = false;
    event.stopPropagation();
  };
  const handleEnd: Handler = event => {
    if (active && !props.disabled) props.onClick();
    active = false;
    event.stopPropagation();
  };

  const cls = props.checked ? "list checked" : "list";

  return (
    <div
      className={cls}
      role="button"
      title={props.title}
      onPointerDown={handleStart}
      onPointerMove={handleMove}
      onPointerOut={handleMove}
      onPointerUp={handleEnd}
    >
      <div className="checkbox"></div>
      <div className="name">{props.label}</div>
    </div>
  );

};