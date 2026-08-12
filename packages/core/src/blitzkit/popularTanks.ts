import { staticAsset } from "@blitzkit/core";
import { fetchPB } from "../protobuf";
import { PopularTanks } from "../protos";

export function fetchPopularTanks() {
  return fetchPB(staticAsset("definitions/popular-tanks.pb"), PopularTanks);
}
