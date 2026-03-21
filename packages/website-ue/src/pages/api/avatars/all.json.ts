import { api } from "../../../core/api/dynamic";

/**
 * Identical to `avatars/[id].json`, but returns data on all avatars at once,
 * mapped by `id`. Beware, the returned `JSON` is large.
 *
 * @type avatars.Avatars
 */
export async function GET() {
  const avatars = await api.avatars();
  return Response.json(avatars);
}
