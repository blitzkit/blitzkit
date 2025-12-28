import { api } from "../../../core/api/dynamic";

/**
 * List!
 */
export async function GET() {
  const list = await api.tankList();
  return Response.json(list);
}
