import { toUniqueId } from '@blitzkit/core';
import { NodeIO } from '@gltf-transform/core';
import { readdir } from 'fs/promises';
import { extractArmor } from '../core/blitz/extractArmor';
import { readXMLDVPL } from '../core/blitz/readXMLDVPL';
import { commitAssets } from '../core/github/commitAssets';
import { FileChange } from '../core/github/commitMultipleFiles';
import { DATA } from './constants';
import { VehicleDefinitionList } from './definitions';

export async function tankArmors() {
  console.log('Building tank armors...');

  const changes: FileChange[] = [];
  const nodeIO = new NodeIO();
  const nations = await readdir(`${DATA}/XML/item_defs/vehicles`).then(
    (nations) => nations.filter((nation) => nation !== 'common'),
  );

  await Promise.all(
    nations.map(async (nation) => {
      const tanks = await readXMLDVPL<{ root: VehicleDefinitionList }>(
        `${DATA}/XML/item_defs/vehicles/${nation}/list.xml`,
      );

      await Promise.all(
        Object.entries(tanks.root).map(async ([tankKey, tank]) => {
          if (tankKey.includes('tutorial_bot')) return;

          const id = toUniqueId(nation, tank.id);
          const model = await extractArmor(DATA, `${nation}-${tankKey}`);
          const content = await nodeIO.writeBinary(model);

          changes.push({
            path: `3d/tanks/armor/${id}.glb`,
            content,
          });
        }),
      );
    }),
  );

  await commitAssets('tank armor', changes);
}
