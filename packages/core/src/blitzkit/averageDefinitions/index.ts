import { staticAsset } from "@blitzkit/core";
import { AverageDefinitions } from "../../../../protos/src/blitzkit";
import { fetchPB } from "../../api";

export interface AverageDefinitionsManifest {
  version: 1;
  /**
   * epoch in days
   */
  latest: number;
}

export async function fetchAverage() {
  return await fetchPB(staticAsset("averages.pb"), AverageDefinitions);
}

export * from "./constants";
