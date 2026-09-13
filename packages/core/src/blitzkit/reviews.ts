import { staticAsset } from "@blitzkit/core";
import { fetchPB } from "../protobuf";
import { Reviews } from "../../../protos/src/blitzkit";

export function fetchReviews() {
  return fetchPB(staticAsset("definitions/reviews.pb"), Reviews);
}
