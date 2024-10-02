import { FC, useState, useEffect, useCallback, useMemo, memo } from "react";
import { controller } from "./util";
import { Renderer, Bits, WH } from "../../utils/types";
import { minifyCss, isNil } from "../../utils/utils";
import { onColor, offColor } from "../../utils/consts";
import { Parameters, Control, Info } from "../../utils/params";
import { RenderOptions } from "../../renderer_utils/params";
import { lists as renderers } from "../../renderer_utils/list";
import "./View.css";

type ContainerProps = RenderOptions & Control & Info & Parameters;

export const Container: FC<ContainerProps> = (props) => {
  const { bits, windowSize } = controller(props);

  return (
    <div id="container">
      <div id="frame">
        <View
          bits={bits}
          side={props.pixels}
          windowSize={windowSize}
          {...props}
        />
      </div>
    </div>
  );
};



type ViewProps = {
  bits: Bits;
  side: number;
  windowSize: WH;
} & RenderOptions & Control;

const View: FC<ViewProps> = (props) => {
  // find the renderer we can run on the browser
  const activeRenderers = useMemo(() => (
    renderers.filter(renderer => renderer.isActive)
  ), []);

  // set the renderer displayed initially
  useEffect(
    () => {
      props.setCurrentRenderer(
        activeRenderers.length === 0 ?
        null :
        activeRenderers[0].name
      );
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  if (isNil(props.currentRenderer)) return <FailureView message="No renderer is available in this browser" />;

  return <>
    {renderers.map((renderer, idx) => (
      <RendererWrapper
        key={idx}
        active={renderer.name === props.currentRenderer}
        renderer={renderer}
        {...props}
      />
    ))}
    <ViewStyle />
  </>;
};



const ViewStyle: FC = memo(() => {
  const arrayToRgba = (color: Uint8ClampedArray) => `rgba(${color.slice(0,3)},${color[3]/255})`;

  const src = minifyCss(`
    .view {
      --on-color: ${arrayToRgba(onColor)};
      --off-color: ${arrayToRgba(offColor)};
    }
  `);
  return <style>{src}</style>;
});



type WrapperProps = {
  renderer: Renderer;
  active: boolean;
} & ViewProps;

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

  // the function to show the failure message
  const notifyFailure = useCallback(
    (message?: string) => {
      setFailure(true);
      setFailureMessage(message);
      // stop updating when failure
      props.setPlaying(false);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [props.setPlaying]
  );

  if (!props.active) return <></>;

  if (failure) {
    const message =
      isNil(failureMessage) ?
      `Failed to render ${props.renderer.name}` :
      `Failed to render ${props.renderer.name}: ${failureMessage}`;

    return <FailureView message={message} />;
  }

  const RendererView = props.renderer.view;
  return <RendererView {...props} notifyFailure={notifyFailure} />;
};



type FailureViewProps = {
  message: string;
};

const FailureView: FC<FailureViewProps> = (props) => (
  <div className="view message">{props.message}</div>
);
