import sharp from 'sharp';
import { readDVPLFile } from '../../src/core/blitz/readDVPLFile';
import { readYAMLDVPL } from '../../src/core/blitz/readYAMLDVPL';
import { commitAssets } from '../../src/core/blitzkit/commitAssets';
import { FileChange } from '../../src/core/blitzkit/commitMultipleFiles';
import { DATA } from './constants';
import { SquadBattleTypeStyles } from './definitions';

export async function gameModeIcons(production: boolean) {
  const changes: FileChange[] = [];
  const gameTypeSelectorStyles = await readYAMLDVPL<SquadBattleTypeStyles>(
    `${DATA}/UI/Screens/Lobby/Hangar/GameTypeSelector.yaml.dvpl`,
  );
  const squadBattleTypeStyles = await readYAMLDVPL<SquadBattleTypeStyles>(
    `${DATA}/UI/Screens3/Lobby/Hangar/Squad/SquadBattleType.yaml.dvpl`,
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

    const content = (
      await sharp(await readDVPLFile(`${DATA}${path}.packed.webp.dvpl`))
        .trim({ background: { r: 0, g: 0, b: 0, alpha: 0 } })
        .toBuffer()
    ).toString('base64');

    changes.push({
      path: `icons/game_mode_banners/${id}.webp`,
      content,
      encoding: 'base64',
    });
  }

  await commitAssets('game mode icons', changes, production);
}
