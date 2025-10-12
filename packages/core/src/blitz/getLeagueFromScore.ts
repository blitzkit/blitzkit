import { LEAGUES } from "./rating";

export function getLeagueFromScore(score: number) {
  return LEAGUES.find(({ minScore }) => score >= minScore)!;
}
