import {
  ConsumableDefinitions,
  type ConsumablesCommon,
  type OptionalDevices,
} from "@blitzkit/core";
import { api } from "../../../blitzkit/api";
import { vfs } from "../../../core/blitzkit/vfs";

export { getStaticPaths } from "../_index";

export async function GET() {
  const samples: Record<string, any> = {};

  const optionalDevices = await vfs.xml<{
    root: OptionalDevices;
  }>("Data/XML/item_defs/vehicles/common/optional_devices.xml");

  for (const key in optionalDevices.root) {
    samples[key] = optionalDevices.root[key].script;
  }

  const consumablesRoot = "Data/XML/item_defs/vehicles/common/consumables";
  const consumablesList = await vfs.text(`${consumablesRoot}/list.xml`);
  const consumablesListEntryPattern = /<items path="(\w+)\.xml"\/>/gm;

  for (const match of consumablesList.matchAll(consumablesListEntryPattern)) {
    const group = match[1];
    const path = `${consumablesRoot}/${group}.xml`;
    const consumables = await vfs.xml<{ root: ConsumablesCommon }>(path);

    for (const key in consumables.root) {
      samples[key] = consumables.root[key].script;
    }
  }

  const provisionsRoot = "Data/XML/item_defs/vehicles/common/provisions";
  const provisionsList = await vfs.text(`${provisionsRoot}/list.xml`);
  const provisionsListEntryPattern = /<items path="(\w+)\.xml"\/>/gm;

  for (const match of provisionsList.matchAll(provisionsListEntryPattern)) {
    const group = match[1];
    const path = `${provisionsRoot}/${group}.xml`;
    const provisions = await vfs.xml<{ root: ConsumablesCommon }>(path);

    for (const key in provisions.root) {
      samples[key] = provisions.root[key].script;
    }
  }

  return Response.json(Object.values(samples));

  const definitions = await api.consumables();
  const bytes = ConsumableDefinitions.encode(definitions).finish();

  return new Response(bytes);
}
