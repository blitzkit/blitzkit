import { api } from "../../../core/api/dynamic";

/**
 * Returns a list of all avatars ids.
 *
 * @type avatar_list.AvatarList
 */
export async function GET() {
  const list = await api.avatarList();
  return Response.json(list);
}
