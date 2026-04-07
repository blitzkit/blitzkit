import sharp from "sharp";
import { AssetUploader } from "../core/github/assetUploader";
import { parsePackedSpriteRect } from "../core/blitz/parsePackedSpriteRect";
import { vfs } from "./constants";
import { ConsumablesCommon, ProvisionsCommon } from "./definitions";

interface Mappings {
  Header: { version: number };
  StyleSheets: {
    selectors: string[];
    properties: { "bg-sprite": string };
  }[];
}

const listItemsPattern = /<items path="(.+)\.xml"\/>/g;

async function extractPackedIcon(
  texture: sharp.Sharp,
  sizes: number[],
  context: string,
) {
  const [left, top, width, height] = sizes;
  const bounds = [left, top, width, height];

  if (!bounds.every(Number.isInteger)) {
    throw new Error(
      `Invalid RIFF sprite bounds for ${context}: ${bounds.join(" ")}`,
    );
  }

  const metadata = await texture.metadata();

  if (metadata.width === undefined || metadata.height === undefined) {
    throw new Error(`Failed to read image dimensions for ${context}`);
  }

  if (
    left < 0 ||
    top < 0 ||
    width <= 0 ||
    height <= 0 ||
    left + width > metadata.width ||
    top + height > metadata.height
  ) {
    throw new Error(
      `Out-of-bounds RIFF sprite for ${context}: ${bounds.join(" ")} in ${metadata.width}x${metadata.height}`,
    );
  }

  return await texture.clone().extract({ left, top, width, height }).toBuffer();
}

export async function consumableProvisionIcons() {
  console.log("Building consumable and provision icons...");

  using uploader = new AssetUploader("consumable and provision icons");
  const styles = [
    "UI/Styles/Lobby/Inventory/InventoryNormalStyles.yaml",
    "UI/Styles/Lobby/Inventory/Event/InventoryBigStyles.yaml",
    "UI/Styles/Lobby/Inventory/Event/InventoryNormalStyles.yaml",
    "UI/Screens3/Lobby/Inventory/Equipment/EquipmentItemImage.style.yaml",
    "UI/Screens/Battle/Styles/BattleEquipmentStyles.yaml",
  ];
  const styleSheets = await Promise.all(
    styles.map(async (path) =>
      Object.values((await vfs.yaml<Mappings>(`Data/${path}`)).StyleSheets),
    ),
  ).then((array) => array.flat());

  for (const match of (
    await vfs.text(`Data/XML/item_defs/vehicles/common/consumables/list.xml`)
  ).matchAll(listItemsPattern)) {
    const consumablesCommon = await vfs.xml<{
      root: ConsumablesCommon;
    }>(`Data/XML/item_defs/vehicles/common/consumables/${match[1]}.xml`);

    for (const consumable of Object.values(consumablesCommon.root)) {
      const styleSheet = styleSheets.find((styleSheet) =>
        styleSheet.selectors.some((selector) =>
          selector.includes(`${consumable.icon} `),
        ),
      );

      if (!styleSheet) {
        console.warn(
          `No style sheet found for consumable ${consumable.icon}; skipping...`,
        );
        continue;
      }

      const configPath = styleSheet.properties["bg-sprite"]
        .replace("~res:/", "")
        .replace(".psd", "")
        .replace(".txt", "");

      if (await vfs.resolve(`Data/${configPath}.packed.webp`)) {
        const packedBuffer = await vfs.file(`Data/${configPath}.packed.webp`);
        const consumablesTexture = sharp(packedBuffer);
        const sizes = parsePackedSpriteRect(packedBuffer);
        let content: Buffer;

        if (sizes) {
          content = await extractPackedIcon(
            consumablesTexture,
            sizes,
            `consumable ${consumable.icon}`,
          );
        } else {
          content = await consumablesTexture.trim({ threshold: 80 }).toBuffer();
        }

        await uploader.add({
          path: `icons/consumables/${consumable.id}.webp`,
          content,
        });
      } else {
        const consumablesTexture = sharp(
          await vfs.file(
            `${`Data/${configPath}`
              .split("/")
              .slice(0, -1)
              .join("/")}/texture0.packed.webp`,
          ),
        );
        const sizes = (await vfs.text(`Data/${configPath}.txt`))
          .split("\n")[4]
          .split(" ")
          .map(Number);
        const content = await consumablesTexture
          .clone()
          .extract({
            left: sizes[0],
            top: sizes[1],
            width: sizes[2],
            height: sizes[3],
          })
          .toBuffer();

        await uploader.add({
          path: `icons/consumables/${consumable.id}.webp`,
          content,
        });
      }
    }
  }

  for (const match of (
    await vfs.text(`Data/XML/item_defs/vehicles/common/provisions/list.xml`)
  ).matchAll(listItemsPattern)) {
    const provisionsCommon = await vfs.xml<{
      root: ProvisionsCommon;
    }>(`Data/XML/item_defs/vehicles/common/provisions/${match[1]}.xml`);

    for (const provision of Object.values(provisionsCommon.root)) {
      const styleSheet = styleSheets.find((styleSheet) =>
        styleSheet.selectors.some((selector) =>
          selector.includes(`${provision.icon} `),
        ),
      );

      if (!styleSheet) {
        console.warn(
          `No style sheet found for provision ${provision.icon}; skipping...`,
        );
        continue;
      }

      const configPath = styleSheet.properties["bg-sprite"]
        .replace("~res:/", "")
        .replace(".psd", "")
        .replace(".txt", "");

      if (await vfs.resolve(`Data/${configPath}.packed.webp`)) {
        const packedBuffer = await vfs.file(`Data/${configPath}.packed.webp`);
        const provisionsTexture = sharp(packedBuffer);
        const sizes = parsePackedSpriteRect(packedBuffer);
        let content: Buffer;

        if (sizes) {
          content = await extractPackedIcon(
            provisionsTexture,
            sizes,
            `provision ${provision.icon}`,
          );
        } else {
          content = await provisionsTexture.trim({ threshold: 80 }).toBuffer();
        }

        await uploader.add({
          path: `icons/provisions/${provision.id}.webp`,
          content,
        });
      } else {
        const provisionsTexture = sharp(
          await vfs.file(
            `${`Data/${configPath}`
              .split("/")
              .slice(0, -1)
              .join("/")}/texture0.packed.webp`,
          ),
        );
        const sizes = (await vfs.text(`Data/${configPath}.txt`))
          .split("\n")[4]
          .split(" ")
          .map(Number);
        const content = await provisionsTexture
          .clone()
          .extract({
            left: sizes[0],
            top: sizes[1],
            width: sizes[2],
            height: sizes[3],
          })
          .toBuffer();

        await uploader.add({
          path: `icons/provisions/${provision.id}.webp`,
          content,
        });
      }
    }
  }

  await uploader.flush();
}
