import type { APIContext, GetStaticPaths } from "astro";
import { api } from "../../../core/api/dynamic";

export const getStaticPaths = (async () => {
  const { backgrounds } = await api.backgrounds();

  return backgrounds.map((background) => ({
    params: { id: background.name },
  }));
}) satisfies GetStaticPaths;

export async function GET({ params }: APIContext<never, { id: string }>) {
  const background = await api.background(params.id);
  return Response.json(background);
}
