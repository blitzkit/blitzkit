import { awaitableAverageDefinitions } from "../core/awaitables/averageDefinitions";
import { awaitableDiscoveredIdsDefinitions } from "../core/awaitables/discoveredIdsDefinitions";

const [discoveredIdsDefinitions, averageDefinitions] = await Promise.all([
  awaitableDiscoveredIdsDefinitions,
  awaitableAverageDefinitions,
]);

export function useAveragesExclusionRatio() {
  return discoveredIdsDefinitions.count / averageDefinitions.samples!.total;
}
