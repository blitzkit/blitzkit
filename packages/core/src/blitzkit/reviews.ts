import { staticAsset } from "@blitzkit/core";
import { Reviews } from "../../../protos/src/blitzkit";
import { fetchPB } from "../api";

export function fetchReviews() {
  return fetchPB(staticAsset("definitions/reviews.pb"), Reviews);
}
