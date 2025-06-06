import { existsSync } from 'fs';
import sharp from 'sharp';
import { readDVPLFile } from '../../src/core/blitz/readDVPLFile';
import { readStringDVPL } from '../../src/core/blitz/readStringDVPL';
import { readXMLDVPL } from '../core/blitz/readXMLDVPL';
import { readYAMLDVPL } from '../core/blitz/readYAMLDVPL';
import { commitAssets } from '../core/github/commitAssets';
import { FileChange } from '../core/github/commitMultipleFiles';
import { DATA } from './constants';
import { ConsumablesCommon, ProvisionsCommon } from './definitions';

interface Mappings {
  Header: { version: number };
  StyleSheets: {
    selectors: string[];
    properties: { 'bg-sprite': string };
  }[];
}

const listItemsPattern = /<items path="(.+)\.xml"\/>/g;

export async function consumableProvisionIcons() {
  console.log('Building consumable and provision icons...');

  const changes: FileChange[] = [];

  const styles = [
    'UI/Styles/Lobby/Inventory/Event/InventoryBigStyles.yaml',
    'UI/Styles/Lobby/Inventory/Event/InventoryNormalStyles.yaml',
    'UI/Styles/Lobby/Inventory/InventoryNormalStyles.yaml',
    'UI/Screens3/Lobby/Inventory/Equipment/EquipmentItemImage.style.yaml',
    'UI/Screens/Battle/Styles/BattleEquipmentStyles.yaml',
  ];
  const styleSheets = await Promise.all(
    styles.map(async (path) =>
      Object.values(
        (await readYAMLDVPL<Mappings>(`${DATA}/${path}`)).StyleSheets,
      ),
    ),
  ).then((array) => array.flat());

  for (const match of (
    await readStringDVPL(
      `${DATA}/XML/item_defs/vehicles/common/consumables/list.xml`,
    )
  ).matchAll(listItemsPattern)) {
    const consumablesCommon = await readXMLDVPL<{
      root: ConsumablesCommon;
    }>(`${DATA}/XML/item_defs/vehicles/common/consumables/${match[1]}.xml`);

    await Promise.all(
      Object.values(consumablesCommon.root).map(async (consumable) => {
        const styleSheet = styleSheets.find((styleSheet) =>
          styleSheet.selectors.some((selector) =>
            selector.includes(`${consumable.icon} `),
          ),
        );

        if (!styleSheet) {
          console.warn(
            `No style sheet found for consumable ${consumable.icon}; skipping...`,
          );
          return;
        }

        const configPath = styleSheet.properties['bg-sprite']
          .replace('~res:/', '')
          .replace('.psd', '')
          .replace('.txt', '');

        if (existsSync(`${DATA}/${configPath}.packed.webp`)) {
          const image = sharp(
            await readDVPLFile(`${DATA}/${configPath}.packed.webp`),
          );
          const content = await image.trim({ threshold: 100 }).toBuffer();

          changes.push({
            path: `icons/consumables/${consumable.id}.webp`,
            content,
          });
        } else {
          const consumablesTexture = sharp(
            await readDVPLFile(
              `${`${DATA}/${configPath}`.split('/').slice(0, -1).join('/')}/texture0.packed.webp`,
            ),
          );
          const sizes = (await readStringDVPL(`${DATA}/${configPath}.txt`))
            .split('\n')[4]
            .split(' ')
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

          changes.push({
            path: `icons/consumables/${consumable.id}.webp`,
            content,
          });
        }
      }),
    );
  }

  for (const match of (
    await readStringDVPL(
      `${DATA}/XML/item_defs/vehicles/common/provisions/list.xml`,
    )
  ).matchAll(listItemsPattern)) {
    const provisionsCommon = await readXMLDVPL<{
      root: ProvisionsCommon;
    }>(`${DATA}/XML/item_defs/vehicles/common/provisions/${match[1]}.xml`);
    await Promise.all(
      Object.values(provisionsCommon.root).map(async (provision) => {
        const styleSheet = styleSheets.find((styleSheet) =>
          styleSheet.selectors.some((selector) =>
            selector.includes(`${provision.icon} `),
          ),
        );

        if (!styleSheet) {
          console.warn(
            `No style sheet found for provision ${provision.icon}; skipping...`,
          );
          return;
        }

        const configPath = styleSheet.properties['bg-sprite']
          .replace('~res:/', '')
          .replace('.psd', '')
          .replace('.txt', '');

        if (existsSync(`${DATA}/${configPath}.packed.webp`)) {
          const image = sharp(
            await readDVPLFile(`${DATA}/${configPath}.packed.webp`),
          );
          const content = await image.trim({ threshold: 100 }).toBuffer();

          changes.push({
            path: `icons/provisions/${provision.id}.webp`,
            content,
          });
        } else {
          const provisionsTexture = sharp(
            await readDVPLFile(
              `${`${DATA}/${configPath}`.split('/').slice(0, -1).join('/')}/texture0.packed.webp`,
            ),
          );
          const sizes = (await readStringDVPL(`${DATA}/${configPath}.txt`))
            .split('\n')[4]
            .split(' ')
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

          changes.push({
            path: `icons/provisions/${provision.id}.webp`,
            content,
          });
        }
      }),
    );
  }

  await commitAssets('consumable and provision icons', changes);
}
