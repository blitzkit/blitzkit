import type { APIContext } from "astro";
import { api } from "../../../core/api/dynamic";
import { imageProxy } from "../../../core/api/imageProxy";

export { getStaticPaths } from "./[id].json";

/**
 * Returns an avatar image based on its `id` in the `webp` format.
 *
 * @see avatars/list.json for all avatar ids.
 * @see avatars/[id].json for data on all avatar.
 */
export async function GET({ params }: APIContext<never, { id: string }>) {
  const avatar = await api.avatar(params.id);
  return await imageProxy(avatar.profile_avatar!.avatar);
}
