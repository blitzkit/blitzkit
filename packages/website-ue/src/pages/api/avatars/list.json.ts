import { api } from "../../../core/api/dynamic";

/**
 * @type avatar_list.AvatarList
 */
export async function GET() {
  const list = await api.avatarList();
  return Response.json(list);
}
