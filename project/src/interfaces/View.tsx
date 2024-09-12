import { FC, useState, useRef, useEffect } from "react";
import { Parameters, Bits, RendererDefs } from "../utils/types";
import { Calc, Runner } from "../utils/utils";
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

  // failure notifier
  const [failure, setFailure] = useState<boolean>(false);
  const [failureMessage, setFailureMessage] = useState<Nullable<string>>(null);
  const notifyFailure = (message?:string) => {
    setFailureMessage(message);
    setFailure(true);
  };

  // failure message disappeares when the different renderer is selected
  useEffect(
    () => {
      setFailureMessage(null);
      setFailure(false);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [props.current]
  );

  const view = (() => {
    if (failure) {
      const message =
        isNil(failureMessage) ?
        `Failed to render ${props.current}` :
        `Failed to render ${props.current}: ${failureMessage}`;
      return <FailureView message={message} />;
    }
    else {
      return renderers.map((renderer, idx) => {
        const active =
          renderer.willInstall &&
          ( renderer.name === props.current );
        return (
          <RendererWrapper
            key={idx}
            active={active}
            renderer={renderer}
            bits={bits}
            side={props.pixels}
            windowSize={windowSize}
            notifyFailure={notifyFailure}
            {...props}
          />
        );
      });
    }
  })();

  return (
    <div id="container">
      <div id="frame">
        {view}
      </div>
    </div>
  );
}



type WrapperProps = {
  active: boolean;
} & RendererDefs.RendererProps;

const RendererWrapper: FC<WrapperProps> = (props) => {
  if (!props.active) return <></>;

  const View = props.renderer.view;
  return <View {...props} />;
};



type FailureProps = {
  message: string;
};

const FailureView: FC<FailureProps> = (props) => (
  <div className="view message">{props.message}</div>
);