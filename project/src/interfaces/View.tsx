import { FC, useState, useRef, useEffect, memo } from "react";
import { Parameters, Bits, RendererDefs } from "../utils/types";
import { Calc, Runner, minifyCss } from "../utils/utils";
import { onColor, offColor } from "../utils/consts";
import { lists as renderers, RenderOptions } from "../renderers/list";
import { isNil } from "../utils/type_check";
import "./View.css";

type ContainerProps = RenderOptions & Parameters;

export const Container: FC<ContainerProps> = (props) => {

  // the state array
  const [bits, setBits] = useState<Bits>([]);

  // state changer in the certain interval
  const runner = useRef(Runner.makeRunner());

  // triggered when the user presses the play/pause button
  useEffect(() => {
    if (props.playing) runner.current.play();
    else runner.current.pause();
  }, [props.playing]);

  // triggered when the user changes the interval
  useEffect(() => {
    runner.current.interval = props.interval;
  }, [props.interval]);

  // set action to runner
  runner.current.action = () => {
    const newBits = Calc.next( bits, props );
    setBits(newBits);
  };

  // state variable of window size and update observer
  const [windowSize, setWindowSize] = useState<RendererDefs.WH>({width:0,height:0});
  useEffect(() => {
    const handleResize = () => {
      const bcr = document.documentElement.getBoundingClientRect();
      setWindowSize({
        width: bcr.width, height: bcr.height
      });
    };

    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // side update receiver
  useEffect(
    () => {
      setBits( Calc.sideUpdate(bits, props) );
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [props.pixels]
  );

  return (
    <div id="container">
      <div id="frame">
        {renderers.map((renderer, idx) => {
          const active =
            renderer.isActive &&
            ( renderer.name === props.current );

          return (
            <RendererWrapper
              key={idx}
              active={active}
              renderer={renderer}
              bits={bits}
              side={props.pixels}
              windowSize={windowSize}
              {...props}
            />
          );
        })}
        <ViewStyle />
      </div>
    </div>
  );
}

type WrapperProps = {
  renderer: RendererDefs.Renderer;
  bits: Bits;
  side: number;
  windowSize: RendererDefs.WH;
  active: boolean;
} & RenderOptions;

const RendererWrapper: FC<WrapperProps> = (props) => {

  // failure notifier
  const [failure, setFailure] = useState<boolean>(false);
  const [failureMessage, setFailureMessage] = useState<Nullable<string>>(null);

  // failure message disappeares when the different renderer is selected
  useEffect( () => {
    if (!props.active) {
      setFailureMessage(null);
      setFailure(false);
    }
  }, [props.active]);

  const notifyFailure = (message?: string) => {
    setFailure(true);
    setFailureMessage(message);
  };

  if (!props.active) return <></>;

  if (failure) {
    const message =
      isNil(failureMessage) ?
      `Failed to render ${props.current}` :
      `Failed to render ${props.current}: ${failureMessage}`;

    return <div className="view message">{message}</div>;
  }

  const View = props.renderer.view;
  return <View {...props} notifyFailure={notifyFailure} />;
};

const ViewStyle: FC = memo(() => {
  const arrayToRgba = (color: Uint8ClampedArray) => `rgba(${color.slice(0,3)},${color[3]/255})`;

  const src = minifyCss(`
    .view {
      --on-color: ${arrayToRgba(onColor)};
      --off-color: ${arrayToRgba(offColor)};
    }
  `);
;  return <style>{src}</style>;
});