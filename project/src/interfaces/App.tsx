import { FC, useEffect } from "react";
import { Container } from "./View";
import { Menu } from "./Menu";
import { lists as renderers } from "../renderer_utils/list";
import { initParams, initRenderOptions } from "../utils/params";
import { isNil } from "../utils/type_check";
import "./App.css";

export const App: FC = () => {

  const params = initParams();
  const renderOptions = initRenderOptions();

  useEffect(
    () => {
      const found = renderers.find(
        (renderer) => renderer.isActive
      );
      if (isNil(found)) throw Error("No renderer is available in this browser");
      renderOptions.setCurrent(found.name);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  useEffect(() => {
    document.documentElement.className = params.theme;
  },[params.theme]);

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
