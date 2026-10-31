import { staticAsset } from "@blitzkit/core";
import { PopularTanks } from "../../../protos/src/blitzkit";
import { fetchPB } from "../api";

export function fetchPopularTanks() {
  return fetchPB(staticAsset("definitions/popular-tanks.pb"), PopularTanks);
}
