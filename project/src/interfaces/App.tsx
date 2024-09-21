import { FC, useEffect } from "react";
import { Container } from "./View/View";
import { Menu } from "./Menu/Menu";
import { initParams, initControl, initInfo, initRenderOptions } from "../utils/params";
import "./App.css";

export const App: FC = () => {

  const params = initParams();
  const control = initControl();
  const info = initInfo();
  const renderOptions = initRenderOptions();

  useEffect(() => {
    document.documentElement.className = params.theme;
  },[params.theme]);

  return <>
    <Container
      {...params}
      {...control}
      {...info}
      {...renderOptions}
    />
    <Menu
      {...params}
      {...control}
      {...info}
      {...renderOptions}
    />
  </>;
};
