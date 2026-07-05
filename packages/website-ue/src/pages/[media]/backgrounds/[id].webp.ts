import type { APIContext } from "astro";
import { api } from "../../../api/dynamic";
import { imageProxy } from "../../../api/imageProxy";
import { getStaticPaths as _getStaticPaths } from "../_index";
import { mixStaticPaths } from "../../../astro/mixStaticPaths";

export const getStaticPaths = mixStaticPaths(_getStaticPaths, async () => {
  const { backgrounds } = await api.backgrounds();
  return backgrounds.map(({ id }) => ({ params: { id } }));
});

export async function GET({ params }: APIContext<never, { id: string }>) {
  const background = await api.background(params.id);
  return await imageProxy(background.profile_background!.background);
}
