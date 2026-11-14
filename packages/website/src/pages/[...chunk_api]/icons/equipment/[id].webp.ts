import type { OptionalDevices } from "@blitzkit/core";
import type { APIContext, GetStaticPathsItem } from "astro";
import sharp from "sharp";
import { mixStaticPaths } from "../../../../astro/mixStaticPaths";
import { vfs } from "../../../../core/blitzkit/vfs";
import { getStaticPaths as _getStaticPaths } from "../../_index";

interface Mappings {
  Header: { version: number };

  StyleSheets: {
    selectors: string[];
    properties: { "bg-sprite": string };
  }[];
}

export const getStaticPaths = mixStaticPaths(_getStaticPaths, async () => {
  const paths: GetStaticPathsItem[] = [];

  console.log("Building equipment icons...");

  const optionalDevices = await vfs.xml<{ root: OptionalDevices }>(
    `Data/XML/item_defs/vehicles/common/optional_devices.xml`,
  );
  const mappings = await vfs.yaml<Mappings>(
    `Data/UI/Screens3/Lobby/Inventory/OptionalDevices/OptionalDevicesItemImage.style.yaml`,
  );

  for (const optionalDeviceKey in optionalDevices.root) {
    const optionalDevice = optionalDevices.root[optionalDeviceKey];

    if (optionalDeviceKey === "nextAvailableId") continue;

    const mapping = mappings.StyleSheets.find((mapping) =>
      mapping.selectors.includes(
        `.optional_device_item.${optionalDevice.icon} #Img`,
      ),
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
        props: {
          sizes: undefined,
          source: `Data/${configPathWebp}.packed.webp`,
        },
      });
    } else {
      const config = await vfs.text(`Data/${configPath}`);
      const sizes = config.split("\n")[4].split(" ").map(Number);

      paths.push({
        params: { id: optionalDevice.id },
        props: {
          sizes,
          source: `Data/Gfx/UI/InventoryIcons/Big/OptionalDevices/texture0.packed.webp`,
        },
      });
    }
  }

  return paths;
});

export async function GET({
  props,
}: APIContext<{ sizes?: number[]; source: string }>) {
  const image = sharp(await vfs.file(props.source));
  let buffer: Buffer;

  if (props.sizes) {
    buffer = await image
      .extract({
        left: props.sizes[0],
        top: props.sizes[1],
        width: props.sizes[2],
        height: props.sizes[3],
      })
      .toBuffer();
  } else {
    buffer = await image.trim().toBuffer();
  }

  const bytes = new Uint8Array(buffer);

  return new Response(bytes);
}
