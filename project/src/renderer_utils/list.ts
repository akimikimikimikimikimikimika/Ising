import { renderer as webglRenderer } from "../renderers/webgl";
import { renderer as webgpuRenderer } from "../renderers/webgpu";
import { renderer as canvasRenderer } from "../renderers/canvas";
import { renderer as divCssPaintingRenderer } from "../renderers/divCssPainting";
import { renderer as divBackgroundRenderer } from "../renderers/divBackground";
import { renderer as divClipPathPolygonRenderer } from "../renderers/divClipPathPolygon";
import { renderer as divShadowRenderer } from "../renderers/divShadow";
import { renderer as divGradientRenderer } from "../renderers/divGradient";
import { renderer as divGridRenderer } from "../renderers/divGrid";
import { renderer as divFlexRenderer } from "../renderers/divFlex";
import { renderer as divAbsoluteRenderer } from "../renderers/divAbsolute";
import { renderer as divInlineBlockRenderer } from "../renderers/divInlineBlock";
import { renderer as divSublatticesRenderer } from "../renderers/divSublattices";
import { renderer as svgPathRenderer } from "../renderers/svgPath";
import { renderer as svgPolygonRenderer } from "../renderers/svgPolygon";
import { renderer as svgRectLineRenderer } from "../renderers/svgRectLine";
import { renderer as svgGradientRenderer } from "../renderers/svgGradient";
import { RendererDefs } from "../utils/types";

export const lists: RendererDefs.Renderer[] = [
  webglRenderer,
  webgpuRenderer,
  canvasRenderer,
  divCssPaintingRenderer,
  divBackgroundRenderer,
  divClipPathPolygonRenderer,
  divShadowRenderer,
  divGradientRenderer,
  divGridRenderer,
  divFlexRenderer,
  divAbsoluteRenderer,
  divInlineBlockRenderer,
  divSublatticesRenderer,
  svgPathRenderer,
  svgPolygonRenderer,
  svgRectLineRenderer,
  svgGradientRenderer,
];