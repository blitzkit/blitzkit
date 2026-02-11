import { api } from "../../../core/api/dynamic";

export async function GET() {
  const popular = await api.popularTanks();
  return Response.json(popular);
}
