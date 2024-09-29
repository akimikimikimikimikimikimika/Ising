/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react-hooks/rules-of-hooks */
import { useState, useRef, useEffect } from "react";
import { Bits, RendererDefs } from "../../utils/types";
import { Parameters, Control, Info } from "../../utils/params";
import { Calc, Runner } from "../../utils/utils";

type ControllerProps = Parameters & Control & Info;

// the controller of state & updating
export const controller = (props: ControllerProps) => {

  // the state array
  const [bits, setBits] = useState<Bits>([]);

  // state changer in the certain interval
  const runnerRef = useRef(Runner.makeRunner());

  // triggered when the user presses the play/pause button
  useEffect(
    () => {
      const runner = runnerRef.current;
      if (props.playing) runner.play();
      else runner.pause();
      props.setPassedFrames(null);
      props.setActualInterval(null);
    },
    [props.playing]
  );

  // triggered when the user changes the interval
  useEffect(() => {
    const runner = runnerRef.current;
    runner.interval = props.interval;
  }, [props.interval]);

  // set action to runner
  runnerRef.current.action = () => {
    const runner = runnerRef.current;
    const newBits = Calc.next( bits, props );
    setBits(newBits);
    props.setPassedFrames(runner.passedFrames);
    props.setActualInterval(runner.actualInterval);
  };

  // state variable of window size and update observer
  const [windowSize, setWindowSize] = useState<RendererDefs.WH>({ width: 0, height: 0 });
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
    [props.pixels]
  );

  return { bits, windowSize };
};