import type { APIContext, GetStaticPaths } from "astro";
import { api } from "../../../core/api/dynamic";
import { imageProxy } from "../../../core/api/imageProxy";

export const getStaticPaths = (async () => {
  const { avatars } = await api.avatars();

  return avatars.map((avatar) => ({
    params: { id: avatar.name },
  }));
}) satisfies GetStaticPaths;

/**
 * One day I will write documentation for this
 */
export async function GET({ params }: APIContext<never, { id: string }>) {
  const avatar = await api.avatar(params.id);
  return await imageProxy(avatar.profile_avatar!.avatar);
}
