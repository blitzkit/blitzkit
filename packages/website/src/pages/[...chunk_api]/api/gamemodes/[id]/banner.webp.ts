import type { SquadBattleTypeStylesYaml } from "@blitzkit/core";
import type { APIContext, GetStaticPathsItem } from "astro";
import sharp from "sharp";
import { mixStaticPaths } from "../../../../../core/blitzkit/mixStaticPaths";
import { vfs } from "../../../../../core/blitzkit/vfs";
import { getStaticPaths as _getStaticPaths } from "../../../_index";

export const getStaticPaths = mixStaticPaths(_getStaticPaths, async () => {
  const paths: GetStaticPathsItem[] = [];

  const gameTypeSelectorStyles = await vfs.yaml<SquadBattleTypeStylesYaml>(
    `Data/UI/Screens/Lobby/Hangar/GameTypeSelector.yaml`,
  );
  const squadBattleTypeStyles = await vfs.yaml<SquadBattleTypeStylesYaml>(
    `Data/UI/Screens3/Lobby/Hangar/Squad/SquadBattleType.yaml`,
  );
  const bannerMatches: { name: string; path: string }[] = [];

  for (const match of gameTypeSelectorStyles.Prototypes[0].components.UIDataLocalBindingsComponent.data[1][2].matchAll(
    /eGameMode\.([a-zA-Z]+) -> "~res:([^"]+)"/g,
  )) {
    bannerMatches.push({ name: match[1], path: match[2] });
  }

  for (const match of squadBattleTypeStyles.Prototypes[0].components.UIDataLocalBindingsComponent.data[1][2].matchAll(
    /"(\d+)" -> "battleType\/([a-zA-Z]+)"/g,
  )) {
    const id = Number(match[1]);
    const name = match[2];
    let path = bannerMatches.find(
      (bannerMatch) => bannerMatch.name.toLowerCase() === name.toLowerCase(),
    )?.path;

    if (path === undefined) {
      path = `/Gfx/UI/Hangar/GameTypes/battle-type_${name.toLowerCase()}`;
    }

    paths.push({
      params: { id },
      props: { path: `Data${path}.packed.webp` },
    });
  }

  return paths;
});

export async function GET({ props }: APIContext<{ path: string }>) {
  const buffer = await sharp(await vfs.file(props.path))
    .trim({ background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .toBuffer();
  const bytes = new Uint8Array(buffer);

  return new Response(bytes);
}
