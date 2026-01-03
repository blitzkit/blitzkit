import type { APIContext, GetStaticPaths } from "astro";
import { api } from "../../../core/api/dynamic";

export const getStaticPaths = (async () => {
  const avatars = await api.avatars();

  return avatars.map((avatar) => ({
    params: { id: avatar.name },
  }));
}) satisfies GetStaticPaths;

/**
 * One day I will write documentation for this
 */
export async function GET({ params }: APIContext<never, { id: string }>) {
  const avatar = await api.avatar(params.id);
  const profileAvatar = avatar.ProfileAvatar();

  if (import.meta.env.DEV) {
    return Response.redirect(profileAvatar.avatar);
  }

  const response = await fetch(profileAvatar.avatar);
  const buffer = await response.arrayBuffer();

  return new Response(buffer);
}
