import { staticAsset } from "@blitzkit/core";
import { fetchPB } from "../../protobuf";
import { AverageDefinitions } from "../../protos";

export interface AverageDefinitionsManifest {
  version: 1;
  /**
   * epoch in days
   */
  latest: number;
}

export async function fetchAverageDefinitions() {
  return await fetchPB(staticAsset("averages.pb"), AverageDefinitions);
}

export * from "./constants";
