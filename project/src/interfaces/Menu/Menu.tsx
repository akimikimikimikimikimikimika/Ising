import { FC } from "react";
import { Caption, Range, Chooser, NameValue } from "./RowItem";
import { RendererSettings } from "./RendererSettings";
import { Parameters, Control, Info } from "../../utils/params";
import { Rng, Theme } from "../../utils/types";
import { isNil } from "../../utils/utils";
import { RenderOptions } from "../../renderer_utils/params";
import "./Menu.css";


type MenuProps = Parameters & Control & Info & RenderOptions;

export const Menu: FC<MenuProps> = (props) => (
  <div id="menu">
    <Caption title="Parameters" />
    <Range
      name="logT"
      min={-2} max={+2} step={0.5}
      formatter={integerFormatter}
      value={props.temp} setValue={props.setTemp}
    />
    <Range
      name="H"
      min={-6} max={+6} step={2}
      formatter={integerFormatter}
      value={props.magField} setValue={props.setMagField}
    />
    <Range
      name="J"
      min={-1} max={+1} step={1}
      formatter={integerFormatter}
      value={props.interaction} setValue={props.setInteraction}
    />
    <Range
      name="pixels"
      min={2} max={150} step={1}
      value={props.pixels} setValue={props.setPixels}
    />
    <Caption title="Controls" />
    <Chooser
      name="Updating"
      mode="segmented"
      options={[
        { value: true , label: "On"  },
        { value: false, label: "Off" }
      ]}
      value={props.playing}
      setValue={props.setPlaying}
    />
    <Range
      name="Minimum Updating Interval"
      min={50} max={1000} step={50}
      formatter={intervalFormatter}
      value={props.interval} setValue={props.setInterval}
    />
    <NameValue
      name="Actual Interval"
      value={props.actualInterval}
      formatter={actualIntervalFormatter}
    />
    <NameValue
      name="Animation Frames"
      value={props.passedFrames}
      formatter={passedFramesFormatter}
    />
    <RendererSettings {...props} />
    <Caption title="Other Settings" />
    <Chooser
      name="RNG"
      mode="segmented"
      options={[
        { value: Rng.Normal, label: "Normal" },
        { value: Rng.Crypto, label: "Crypto" }
      ]}
      value={props.rng}
      setValue={props.setRng}
    />
    <Chooser
      name="Theme"
      mode="segmented"
      options={[
        { value: Theme.Auto , label: "Auto"  },
        { value: Theme.Light, label: "Light" },
        { value: Theme.Dark , label: "Dark"  }
      ]}
      value={props.theme}
      setValue={props.setTheme}
    />
  </div>
);

const integerFormatter = (value: number) => {
  if (value > 0) return `+${value}`;
  if (value < 0) return `-${-value}`;
  return `${value}`;
};

const intervalFormatter = (value: number) => (
  value % 1e3 === 0 ? `${value/1e3}.00 sec` :
  value % 1e2 === 0 ? `${value/1e3}0 sec`  :
  `${value/1e3} sec`
);

const actualIntervalFormatter = (ms: number | null) => {
  if (isNil(ms)) return "N/A";

  const sec = Math.round( ms ) / 1e3;
  return (
    ( sec * 1e0 ) % 1 === 0 ? `${sec}.000 sec` :
    ( sec * 1e1 ) % 1 === 0 ? `${sec}00 sec` :
    ( sec * 1e2 ) % 1 === 0 ? `${sec}0 sec` :
    `${sec} sec`
  );
};

const passedFramesFormatter = (value: number | null) => {
  if (isNil(value)) return "N/A";

  switch (value) {
    case 0: case 1:
      return `${value} frame`;
    default:
      return `${value} frames`;
  }
};