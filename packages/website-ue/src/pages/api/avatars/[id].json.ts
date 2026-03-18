import type { APIContext, GetStaticPaths } from "astro";
import { api } from "../../../core/api/dynamic";

export const getStaticPaths = (async () => {
  const { avatars } = await api.avatars();

  return avatars.map((avatar) => ({
    params: { id: avatar.name },
  }));
}) satisfies GetStaticPaths;

/**
 * Returns data on an avatar based on its id. @see avatars/list.json for a list of all avatar ids.
 */
export async function GET({ params }: APIContext<never, { id: string }>) {
  const avatar = await api.avatar(params.id);
  return Response.json(avatar);
}
