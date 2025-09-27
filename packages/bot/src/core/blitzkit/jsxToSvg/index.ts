import { readFile } from "fs/promises";
import satori from "satori";
import { RenderConfiguration } from "../renderConfiguration";
import robotoBlack from "./Roboto-Black.ttf";
import robotoBold from "./Roboto-Bold.ttf";
import roboto from "./Roboto.ttf";

const fontsPromise = [
  { file: roboto, weight: 400 as const },
  { file: robotoBold, weight: 700 as const },
  { file: robotoBlack, weight: 900 as const },
].map(async ({ file, weight }) => {
  const data = await readFile(`${__dirname}/${file}`);
  return { name: "Roboto", weight, data };
});

export async function jsxToSvg(
  jsx: React.JSX.Element,
  renderConfiguration = new RenderConfiguration()
) {
  const fonts = await Promise.all(fontsPromise);
  return await satori(jsx, { width: renderConfiguration.width, fonts });
}
