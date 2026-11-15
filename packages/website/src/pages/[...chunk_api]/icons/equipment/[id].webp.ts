import type { OptionalDevices } from "@blitzkit/core";
import type { APIContext, GetStaticPathsItem } from "astro";
import { mixStaticPaths } from "../../../../astro/mixStaticPaths";
import {
  readDiscreteSprite,
  readPackedSprite,
  type DiscreteSpriteProps,
  type PackedSpriteProps,
} from "../../../../core/blitz/readSprite";
import { vfs } from "../../../../core/blitzkit/vfs";
import { getStaticPaths as _getStaticPaths } from "../../_index";

interface Mappings {
  Header: { version: number };

  StyleSheets: {
    selectors: string[];
    properties: { "bg-sprite": string };
  }[];
}

type Props = PackedSpriteProps | DiscreteSpriteProps;

export const getStaticPaths = mixStaticPaths(_getStaticPaths, async () => {
  const paths: GetStaticPathsItem[] = [];

  console.log("Building equipment icons...");

  const optionalDevices = await vfs.xml<{ root: OptionalDevices }>(
    `Data/XML/item_defs/vehicles/common/optional_devices.xml`
  );
  const mappings = await vfs.yaml<Mappings>(
    `Data/UI/Screens3/Lobby/Inventory/OptionalDevices/OptionalDevicesItemImage.style.yaml`
  );

  for (const optionalDeviceKey in optionalDevices.root) {
    const optionalDevice = optionalDevices.root[optionalDeviceKey];

    if (optionalDeviceKey === "nextAvailableId") continue;

    const mapping = mappings.StyleSheets.find((mapping) =>
      mapping.selectors.includes(
        `.optional_device_item.${optionalDevice.icon} #Img`
      )
    );

    if (!mapping) {
      console.warn(`No mapping found for ${optionalDevice.icon}; skipping...`);
      continue;
    }

    const configPathRaw = mapping.properties["bg-sprite"];
    const configPath = configPathRaw.replace("~res:/", "");

    if (configPath.startsWith("Gfx/Lobby")) {
      const configPathWebp = configPath.replace(".txt", "");

      paths.push({
        params: { id: optionalDevice.id },
        props: { packed: `Data/${configPathWebp}.packed.webp` },
      });
    } else {
      paths.push({
        params: { id: optionalDevice.id },
        props: {
          descriptor: `Data/${configPath}`,
          texture: `Data/Gfx/UI/InventoryIcons/Big/OptionalDevices/texture0.packed.webp`,
        },
      });
    }
  }

  return paths;
});

export async function GET({ props }: APIContext<Props>) {
  return new Response(
    "packed" in props
      ? await readPackedSprite(props.packed)
      : await readDiscreteSprite(props.descriptor, props.texture)
  );
}
