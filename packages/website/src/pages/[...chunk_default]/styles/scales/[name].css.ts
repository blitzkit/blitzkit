import type { APIContext } from "astro";
import {
  COLORS,
  colorAliasStyles,
  colorScaleStyles,
} from "../../../../astro/colorStyles";
import { mixStaticPaths } from "../../../../astro/mixStaticPaths";
import { COLORS_ALPHA_ONLY, COLOR_ALIASES } from "../../../../config/styles";
import { getStaticPaths as _getStaticPaths } from "../../_index";

interface ColorStylesProps {
  styles: string;
}

function path(name: string, styles: string) {
  return {
    params: { name },
    props: { styles } satisfies ColorStylesProps,
  };
}

export const getStaticPaths = mixStaticPaths(_getStaticPaths, () => [
  ...COLORS_ALPHA_ONLY.map((color) => path(color, colorScaleStyles(color))),

  ...COLORS.flatMap((color) => [
    path(color, colorScaleStyles(color)),

    ...COLOR_ALIASES.map((alias) =>
      path(`${color}-as-${alias}`, colorAliasStyles(color, alias)),
    ),
  ]),
]);

export function GET({ props }: APIContext<ColorStylesProps>) {
  return new Response(props.styles);
}
