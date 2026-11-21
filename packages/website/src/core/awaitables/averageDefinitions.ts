import { fetchPB, staticAsset } from "@blitzkit/core";
import { AverageDefinitions } from "@blitzkit/protos";

export const awaitableAverageDefinitions = fetchPB(
  staticAsset("averages.pb"),
  AverageDefinitions,
);
