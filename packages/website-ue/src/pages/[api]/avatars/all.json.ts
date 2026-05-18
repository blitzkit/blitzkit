import { api } from "../../../api/dynamic";

export { getStaticPaths } from "../_index";

/**
 * Identical to `avatars/[id].json`, but returns data on all avatars at once,
 * mapped by `id`.
 *
 * @type blitzkit/avatars.Avatars
 */
export async function GET() {
  const avatars = await api.avatars();
  return Response.json(avatars);
}
