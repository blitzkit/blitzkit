import sharp from "sharp";
import { readDVPLFile } from "../../src/core/blitz/readDVPLFile";
import { readStringDVPL } from "../../src/core/blitz/readStringDVPL";
import { readXMLDVPL } from "../core/blitz/readXMLDVPL";
import { readYAMLDVPL } from "../core/blitz/readYAMLDVPL";
import { AssetUploader } from "../core/github/assetUploader";
import { DATA } from "./constants";
import { OptionalDevices } from "./definitions";

interface Mappings {
  Header: { version: number };

  StyleSheets: {
    selectors: string[];
    properties: { "bg-sprite": string };
  }[];
}

export async function equipmentIcons() {
  console.log("Building equipment icons...");

  using uploader = new AssetUploader("equipment icons");
  const optionalDevices = await readXMLDVPL<{ root: OptionalDevices }>(
    `${DATA}/XML/item_defs/vehicles/common/optional_devices.xml`
  );
  const mappings = await readYAMLDVPL<Mappings>(
    `${DATA}/UI/Screens3/Lobby/Inventory/OptionalDevices/OptionalDevicesItemImage.style.yaml`
  );
  const image = sharp(
    await readDVPLFile(
      `${DATA}/Gfx/UI/InventoryIcons/Big/OptionalDevices/texture0.packed.webp`
    )
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
      const image = sharp(
        await readDVPLFile(`${DATA}/${configPathWebp}.packed.webp`)
      );
      const content = await image.trim().toBuffer();

      await uploader.add({
        path: `icons/equipment/${optionalDevice.id}.webp`,
        content,
      });
    } else {
      const config = await readStringDVPL(`${DATA}/${configPath}`);
      const sizes = config.split("\n")[4].split(" ").map(Number);
      const content = await image
        .clone()
        .extract({
          left: sizes[0],
          top: sizes[1],
          width: sizes[2],
          height: sizes[3],
        })
        .toBuffer();

      await uploader.add({
        path: `icons/equipment/${optionalDevice.id}.webp`,
        content,
      });
    }
  }

  await uploader.flush();
}
