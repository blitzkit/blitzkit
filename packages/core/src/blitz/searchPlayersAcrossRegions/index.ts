import { fetchBlitz } from "../fetchBlitz";
import type { Region } from "../regions";
import { usernamePattern } from "./constants";

export interface AccountListItem {
  nickname: string;
  account_id: number;
}
export type AccountList = AccountListItem[];
export type AccountListWithServer = (AccountListItem & {
  region: Region;
})[];

export async function searchPlayersAcrossRegions(search: string, limit = 25) {
  const trimmed = search.trim();
  if (trimmed.length < 3 && trimmed.length > 100) return [];
  const normalizedLimit = Math.floor(limit / 3);

  if (usernamePattern.test(trimmed)) {
    return (
      await Promise.all([
        fetchBlitz<AccountList>("com", "account/list", {
          search,
          limit: normalizedLimit,
        }).then(
          (value) =>
            value &&
            value.map((account) => ({
              ...account,
              region: "com" as Region,
            }))
        ),
        fetchBlitz<AccountList>("eu", "account/list", {
          search,
          limit: normalizedLimit,
        }).then(
          (value) =>
            value &&
            value.map((account) => ({
              ...account,
              region: "eu" as Region,
            }))
        ),
        fetchBlitz<AccountList>("asia", "account/list", {
          search,
          limit: normalizedLimit,
        }).then(
          (value) =>
            value &&
            value.map((account) => ({
              ...account,
              region: "asia" as Region,
            }))
        ),
      ])
    )
      .filter(Boolean)
      .flat() as AccountListWithServer;
  } else {
    return [] as AccountListWithServer;
  }
}

export * from "./constants";
