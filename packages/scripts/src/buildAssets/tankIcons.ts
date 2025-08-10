import { NATION_IDS } from '@blitzkit/core';
import { readdir } from 'fs/promises';
import sharp from 'sharp';
import { Vector3Tuple } from 'three';
import { readDVPLFile } from '../core/blitz/readDVPLFile';
import { readXMLDVPL } from '../core/blitz/readXMLDVPL';
import { readYAMLDVPL } from '../core/blitz/readYAMLDVPL';
import { commitAssets } from '../core/github/commitAssets';
import { FileChange } from '../core/github/commitMultipleFiles';
import { DATA } from './constants';
import { VehicleDefinitionList } from './definitions';

export interface TankParameters {
  resourcesPath: {
    smallIconPath: string;
    bigIconPath: string;
    blitzModelPath: string;
  };
  collision: {
    [key: string]: {
      points: Vector3Tuple;
      bbox: {
        min: Vector3Tuple;
        max: Vector3Tuple;
      };
      averageThickness?: Record<string, number>;
    };
  };
  maskSlice?: {
    [key: string]:
      | {
          enabled: boolean;
          planePosition: Vector3Tuple;
          planeNormal: Vector3Tuple;
          planeAxis: Vector3Tuple;
          frustumConeBaseRadius: number;
          frustumConeAngleDegrees: number;
          planeSliceMode: number;
          frustumConeSliceMode: number;
        }
      | undefined;
  };
}

export async function tankIcons() {
  console.log('Building tank icons...');

  const changes: FileChange[] = [];
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

          const nationVehicleId = tank.id;
          const id = (nationVehicleId << 8) + (NATION_IDS[nation] << 4) + 1;

          const parameters = await readYAMLDVPL<TankParameters>(
            `${DATA}/3d/Tanks/Parameters/${nation}/${tankKey}.yaml`,
          );
          const smallPath = `${DATA}/${parameters.resourcesPath.smallIconPath
            .replace(/~res:\//, '')
            .replace(/\..+/, '')}.packed.webp`;
          const bigPath = `${DATA}/${parameters.resourcesPath.bigIconPath
            .replace(/~res:\//, '')
            .replace(/\..+/, '')}.packed.webp`;
          const big = await sharp(await readDVPLFile(bigPath))
            .trim()
            .toBuffer();
          const small = await sharp(await readDVPLFile(smallPath))
            .trim()
            .toBuffer();

          if (big) {
            changes.push({
              content: big,
              path: `icons/tanks/big/${id}.webp`,
            });
          }
          if (small) {
            changes.push({
              content: small,
              path: `icons/tanks/small/${id}.webp`,
            });
          }
        }),
      );
    }),
  );

  await commitAssets('tank icons', changes);
}
