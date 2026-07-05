import type { BlitzStaticAssetsDiscoveryComponent } from "@protos/blitz_static_assets_discovery_component";

export function assertDiscoveryTag(discovery: BlitzStaticAssetsDiscoveryComponent) {
  if (
    discovery.blocked_tags !== undefined ||
    discovery.required_tags === undefined ||
    discovery.required_tags.tags.length !== 1
  ) {
    throw new TypeError("Unexpected discovery tag format");
  }

  return discovery.required_tags.tags[0].value;
}
