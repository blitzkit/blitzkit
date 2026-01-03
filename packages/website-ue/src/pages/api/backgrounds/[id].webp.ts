import type { APIContext, GetStaticPaths } from "astro";
import { api } from "../../../core/api/dynamic";

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

  if (import.meta.env.DEV) {
    return Response.redirect(profileBackground.background);
  }

  const response = await fetch(profileBackground.background);
  const buffer = await response.arrayBuffer();

  return new Response(buffer);
}
