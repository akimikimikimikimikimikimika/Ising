import { FC, useState, useRef, useCallback, useEffect, ReactNode } from "react";
import { isNil } from "../../utils/utils";



type CaptionProps = {
  title: string;
  hidden?: boolean;
}

export const Caption: FC<CaptionProps> = (props) => {
  if (props.hidden ?? false) return <></>;

  return (
    <div className="caption">{props.title}</div>
  );
};



type RangeProps = {
  name: string;
  value: number;
  setValue: StateSetter<number>;
  formatter?: Formatter;
  min?: Nullable<number>;
  max?: Nullable<number>;
  step?: Nullable<number>;
  hidden?: boolean;
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
  const getValue = useCallback(() => {
    if (isNil(inputRef.current)) return null;
    const valueStr = inputRef.current.value;
    return parseFloat(valueStr);
  }, []);

  const [valueStr, setValueStr] = useState(formatter(value));

  if (props.hidden ?? false) return <></>;

  type OnChange = React.ChangeEventHandler<HTMLInputElement>;
  const handleChange: OnChange = event => {
    const value = getValue();
    if (isNil(value)) return;
    setValueStr(formatter(value));
    event.stopPropagation();
  };

  type OnPointerUp = React.PointerEventHandler<HTMLInputElement>;
  const handlePointerUp: OnPointerUp = event => {
    const value = getValue();
    if (isNil(value)) return;
    setValue(value);
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
          onChange={handleChange}
          onPointerUp={handlePointerUp}
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
  hidden?: boolean;
};
type ChooserFC = <T,>(props: ChooserProps<T>) => ReactNode;

export const Chooser: ChooserFC = (props) => {
  if (props.hidden ?? false) return <></>;

  switch (props.mode) {
    case "selector":
      return <Selector {...props} />;
    case "segmented":
      return <Segmented {...props} />;
  }
};

const Selector: ChooserFC = <T,>(props: ChooserProps<T>) => {
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
          value={index}
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

const Segmented: ChooserFC = <T,>(props: ChooserProps<T>) => {
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
  hidden?: boolean;
  onClick: () => void;
};

export const Button: FC<ButtonProps> = (props) => {

  if (props.hidden ?? false) return <></>;

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

  const cls = props.checked ? "plain button checked" : "plain button unchecked";

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

type NameValueProps<T> = {
  name: string;
  value: T;
  formatter?: (value: T) => string;
};
type NameValueFC = <T,>(props: NameValueProps<T>) => ReactNode;

export const NameValue: NameValueFC = (props) => {
  const formatter = props.formatter ?? (value => `${value}`);
  return (
    <div className="plain name-value">
      <div className="name">{props.name}</div>
      <div className="value">{formatter(props.value)}</div>
    </div>
  );
};
