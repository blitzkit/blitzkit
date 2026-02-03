import { api } from "../../../core/api/dynamic";

export async function GET() {
  throw new Error(
    "MAKE THIS A PROTO AND ADD LAST UPDATED TIME OH AND ADD 0's FOR TANKS WITH NO ENTRIES",
  );
  const popular = await api.popularTanks();
  return Response.json(popular);
}
