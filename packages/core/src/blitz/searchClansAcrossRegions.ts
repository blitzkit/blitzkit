import { ClanList } from "./clans";
import { fetchBlitz } from "./fetchBlitz";
import { Region } from "./regions";

export async function searchClansAcrossRegions(search: string, limit = 25) {
  const trimmed = search.trim();
  if (trimmed.length < 3 && trimmed.length > 100) return [];
  const normalizedLimit = Math.floor(limit / 3);

  // TODO: remove splice once wargaming fixes the functionality of the limit felid

  return (
    await Promise.all([
      fetchBlitz<ClanList>("com", "clans/list", {
        search,
        limit: normalizedLimit,
      }).then((value) =>
        value
          .map((account) => ({
            ...account,
            region: "com" as Region,
          }))
          .splice(0, normalizedLimit)
      ),
      fetchBlitz<ClanList>("eu", "clans/list", {
        search,
        limit: normalizedLimit,
      }).then((value) =>
        value
          .map((account) => ({
            ...account,
            region: "eu" as Region,
          }))
          .splice(0, normalizedLimit)
      ),
      fetchBlitz<ClanList>("asia", "clans/list", {
        search,
        limit: normalizedLimit,
      }).then((value) =>
        value
          .map((account) => ({
            ...account,
            region: "asia" as Region,
          }))
          .splice(0, normalizedLimit)
      ),
    ])
  )
    .filter(Boolean)
    .flat();
}
