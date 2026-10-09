import type { MapsYaml } from "@blitzkit/core";
import { vfs } from "../blitzkit/vfs";

export async function mapsYamlEntry(id: number) {
  const { maps } = await vfs.yaml<MapsYaml>("Data/maps.yaml");
  const entry = Object.entries(maps).find(([, map]) => map.id === id);

  if (!entry) throw new Error(`Map ${id} is missing from maps.yaml`);

  const [key, map] = entry;

  return { key, ...map };
}
