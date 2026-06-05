import type { APIContext } from "astro";
import { api } from "../../../api/dynamic";
import { imageProxy } from "../../../api/imageProxy";
import { getStaticPaths as _getStaticPaths } from "../_index";
import { mixStaticPaths } from "../../../astro/mixStaticPaths";

export const getStaticPaths = mixStaticPaths(_getStaticPaths, async () => {
  const { avatars } = await api.avatars();
  return avatars.map(({ id }) => ({ params: { id } }));
});

/**
 * Returns an avatar image based on its `id` in the `webp` format.
 *
 * @see avatars/list.json for all avatar ids.
 * @see avatars/[id].json for data on all avatar.
 */
export async function GET({ params }: APIContext<never, { id: string }>) {
  const avatar = await api.avatar(params.id);
  return await imageProxy(
    api.mediaPrefix(avatar.profile_avatar!.avatar!.value),
  );
}
