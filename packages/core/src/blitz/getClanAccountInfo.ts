import { fetchBlitz } from "./fetchBlitz";
import { normalizeIds } from "./normalizeIds";
import { Region } from "./regions";

type IndividualClanAccountInfo = {
  account_id: number;
  joined_at: number;
  clan_id: number;
  role: string;
  account_name: string;

  clan?: {
    members_count: number;
    name: string;
    created_at: number;
    tag: string;
    clan_id: number;
    emblem_set_id: number;
  };
} | null;

interface ClanAccountInfo {
  [accountId: number]: IndividualClanAccountInfo;
}

export async function getClanAccountInfo<
  Ids extends number | number[],
  ReturnType = Ids extends number
    ? IndividualClanAccountInfo
    : IndividualClanAccountInfo[],
>(region: Region, ids: Ids, extra: string[] = []) {
  const object = await fetchBlitz<ClanAccountInfo>(
    region,
    "clans/accountinfo",
    {
      account_id: normalizeIds(ids),
      extra: extra.length === 0 ? undefined : extra.join(","),
    }
  );

  if (typeof ids === "number") {
    return object[ids as number] as ReturnType;
  } else {
    return ids.map((id) => object[id]) as ReturnType;
  }
}
