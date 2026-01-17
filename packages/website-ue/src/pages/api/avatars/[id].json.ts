import type { APIContext, GetStaticPaths } from "astro";
import { api } from "../../../core/api/dynamic";

export const getStaticPaths = (async () => {
  const { avatars } = await api.avatars();

  return avatars.map((avatar) => ({
    params: { id: avatar.name },
  }));
}) satisfies GetStaticPaths;

/**
 * This is a very long.
 * And boring.
 *
 * But important.
 * Developer comment.
 *
 * Meant to test.
 * The **formatting**!
 */
export async function GET({ params }: APIContext<never, { id: string }>) {
  const avatar = await api.avatar(params.id);
  return Response.json(avatar);
}
