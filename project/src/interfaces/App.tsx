import { FC, useEffect, useState } from "react";
import { Container } from "./View";
import { Menu } from "./Menu";
import { Rng, Parameters } from "../utils/types";
import { lists as renderers, makeRenderOptions } from "../renderers/list";
import { isNil } from "../utils/type_check";
import "./App.css";

export const App: FC = () => {

  const renderOptions = makeRenderOptions();
  const params = MakeParams();

  useEffect(
    () => {
      const found = renderers.find(
        (renderer) => renderer.willInstall
      );
      if (isNil(found)) throw Error("No renderer is available in this browser");
      renderOptions.setCurrent(found.name);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  useEffect(() => {
    document.documentElement.className = "pcs";
  },[]);

  return <>
    <Container
      {...params}
      {...renderOptions}
    />
    <Menu
      {...params}
      {...renderOptions}
    />
  </>;
};

const MakeParams = (): Parameters => {

  const [temp, setTemp] = useState<number>(1);
  const [magField, setMagField] = useState<number>(0);
  const [interaction, setInteraction] = useState<number>(1);
  const [pixels, setPixels] = useState<number>(50);
  const [interval, setInterval] = useState<number>(100);
  const [playing, setPlaying] = useState<boolean>(false);
  const [rng, setRng] = useState<Rng>("crypto");

  return {
    temp, setTemp,
    magField, setMagField,
    interaction, setInteraction,
    pixels, setPixels,
    playing, setPlaying,
    interval, setInterval,
    rng, setRng
  };
};
