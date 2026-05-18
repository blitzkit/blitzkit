import type { APIContext } from "astro";
import { api } from "../../../api/dynamic";
import { mixStaticPaths } from "../../../astro/mixStaticPaths";
import { getStaticPaths as _getStaticPaths } from "../_index";

export const getStaticPaths = mixStaticPaths(_getStaticPaths, async () => {
  const { avatars } = await api.avatars();

  return avatars.map((avatar) => ({
    params: { id: avatar.name },
  }));
});

/**
 * Returns data on an avatar based on its `id`. Do not use the `.webp` URLs
 * from the returned data as they point to Wargaming's servers which may update
 * over time, out of sync with BlitzKit.
 *
 * @see avatars/list.json for all avatar ids.
 * @see avatars/[id].webp for avatar images.
 * @type blitzkit/avatar.Avatar
 */
export async function GET({ params }: APIContext<never, { id: string }>) {
  const avatar = await api.avatar(params.id);
  return Response.json(avatar);
}
