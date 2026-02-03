import { api } from "../../../core/api/dynamic";

export async function GET() {
  throw new Error("MAKE THIS A PROTO AND ADD LAST UPDATED TIME");
  const popular = await api.popularTanks();
  return Response.json(popular);
}
