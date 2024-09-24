import { FC, useMemo } from "react";
import { Caption, Chooser } from "./RowItem";
import { lists as renderers } from "../../renderer_utils/list";
import { RenderOptions } from "../../renderer_utils/params";
import { isNil } from "../../utils/type_check";

export const RendererSettings: FC<RenderOptions> = (props) => {

  const activeRenderers = useMemo(
    () => renderers.filter( renderer => renderer.isActive ),
    []
  );

  if (isNil(props.currentRenderer)) return <></>;

  return <>
    <Caption
      title="Renderer"
      hidden={isNil(props.currentRenderer)}
    />
    <Chooser
      name="Current Renderer"
      mode="selector"
      options={activeRenderers.map( renderer => renderer.name )}
      value={props.currentRenderer}
      setValue={props.setCurrentRenderer}
    />
    <RendererSpecificOptions {...props} />
  </>;

};

const RendererSpecificOptions: FC<RenderOptions> = (props) => {

  if (isNil(props.currentRenderer)) return <></>;

  const renderer = renderers.find(
  renderer => renderer.name === props.currentRenderer
  );

  if ( isNil(renderer) || isNil(renderer.menu) ) return <></>;

  const caption = `${renderer.name} Options`;
  const Menu = renderer.menu;

  return <>
    <Caption title={caption} />
    <Menu {...props} />
  </>;

};