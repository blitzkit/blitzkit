import type { APIContext, GetStaticPaths } from "astro";
import { api } from "../../../core/api/dynamic";
import { imageProxy } from "../../../core/api/imageProxy";

export const getStaticPaths = (async () => {
  const backgrounds = await api.backgrounds();

  return backgrounds.map((avatar) => ({
    params: { id: avatar.name },
  }));
}) satisfies GetStaticPaths;

/**
 * One day I will write documentation for this
 */
export async function GET({ params }: APIContext<never, { id: string }>) {
  const avatar = await api.background(params.id);
  const profileBackground = avatar.ProfileBackground();

  return await imageProxy(profileBackground.background);
}
