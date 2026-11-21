import type { ProvisionsCommon } from "@blitzkit/core";
import type { APIContext, GetStaticPathsItem } from "astro";
import { mixStaticPaths } from "../../../../astro/mixStaticPaths";
import { readStyleSprite } from "../../../../core/blitz/readSprite";
import { vfs } from "../../../../core/blitzkit/vfs";
import { getStaticPaths as _getStaticPaths } from "../../_index";

interface Mappings {
  Header: { version: number };
  StyleSheets: {
    selectors: string[];
    properties: { "bg-sprite": string };
  }[];
}

const listItemsPattern = /<items path="(.+)\.xml"\/>/g;

export const getStaticPaths = mixStaticPaths(_getStaticPaths, async () => {
  const paths: GetStaticPathsItem[] = [];

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

      const path = styleSheet.properties["bg-sprite"]
        .replace("~res:/", "")
        .replace(".psd", "")
        .replace(".txt", "");

      paths.push({
        props: { path },
        params: { id: provision.id },
      });
    }
  }

  return paths;
});

export async function GET({ props }: APIContext<{ path: string }>) {
  return new Response(await readStyleSprite(`Data/${props.path}`));
}
