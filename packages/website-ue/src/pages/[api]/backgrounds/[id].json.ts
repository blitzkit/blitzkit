import type { APIContext } from "astro";
import { api } from "../../../api/dynamic";
import { mixStaticPaths } from "../../../astro/mixStaticPaths";
import { getStaticPaths as _getStaticPaths } from "../_index";

export const getStaticPaths = mixStaticPaths(_getStaticPaths, async () => {
  const { backgrounds } = await api.backgrounds();

  return backgrounds.map((background) => ({
    params: { id: background.name },
  }));
});

export async function GET({ params }: APIContext<never, { id: string }>) {
  const background = await api.background(params.id);
  return Response.json(background);
}
