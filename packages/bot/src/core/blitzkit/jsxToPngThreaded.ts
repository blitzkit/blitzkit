import { jsxToSvg } from "./jsxToSvg";
import { RenderConfiguration } from "./renderConfiguration";
import { svgToPngThreaded } from "./svgToPngThreaded";

export async function jsxToPngThreaded(
  jsx: React.JSX.Element,
  renderConfiguration: RenderConfiguration
) {
  const svg = await jsxToSvg(jsx, renderConfiguration);
  const png = await svgToPngThreaded(svg);
  return png;
}
