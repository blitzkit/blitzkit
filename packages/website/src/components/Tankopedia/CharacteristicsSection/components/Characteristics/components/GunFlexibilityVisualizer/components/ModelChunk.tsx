import { mauveDark } from '@radix-ui/colors';
import { LineBasicMaterial, MeshBasicMaterial } from 'three';
import { awaitableModelDefinitions } from '../../../../../../../../core/awaitables/modelDefinitions';
import { jsxTree } from '../../../../../../../../core/blitzkit/jsxTree';
import { useModel } from '../../../../../../../../hooks/useModel';
import { Duel } from '../../../../../../../../stores/duel';

const modelDefinitions = await awaitableModelDefinitions;

const surfaceMaterial = new MeshBasicMaterial({
  color: mauveDark.mauve6,
  toneMapped: false,
});
const outlineMaterial = new LineBasicMaterial({
  color: mauveDark.mauve8,
  toneMapped: false,
});

interface Props {
  onlyGun?: boolean;
}

export function ModelChunk({ onlyGun = false }: Props) {
  const tank = Duel.use((state) => state.protagonist.tank);
  const turret = Duel.use((state) => state.protagonist.turret);
  const gun = Duel.use((state) => state.protagonist.gun);

  const tankModel = modelDefinitions.models[tank.id];
  const turretModel = tankModel.turrets[turret.id];
  const gunModel = turretModel.guns[gun.gun_type!.value.base.id];

  const originZ = tankModel.turret_origin.z + turretModel.gun_origin.z;
  const originY = tankModel.turret_origin.y + turretModel.gun_origin.y;

  const { gltf } = useModel(tank.id);
  const nodes = Object.values(gltf.nodes);

  return (
    <group position={[0, -originY, originZ]} rotation={[-Math.PI / 2, 0, 0]}>
      {nodes.map((node) => {
        const isCurrentMantlet =
          node.name ===
          `gun_${gunModel.model_id.toString().padStart(2, '0')}_mask`;
        const isCurrentGun =
          node.name === `gun_${gunModel.model_id.toString().padStart(2, '0')}`;
        const isVisible = isCurrentGun || isCurrentMantlet;
        const isHull = node.name === 'hull';
        const isWheel = node.name.startsWith('chassis_wheel_');
        const isTrack = node.name.startsWith('chassis_track_');
        const isCurrentTurret =
          node.name ===
          `turret_${turretModel.model_id.toString().padStart(2, '0')}`;
        const isAnythingElse = isHull || isWheel || isTrack || isCurrentTurret;

        if ((onlyGun && isVisible) || (!onlyGun && isAnythingElse)) {
          return jsxTree(node, {
            mesh(mesh, props, key) {
              return (
                <>
                  <mesh key={key} {...props} material={surfaceMaterial} />
                  <lineSegments material={outlineMaterial}>
                    <edgesGeometry args={[mesh.geometry, 30]} />
                  </lineSegments>
                </>
              );
            },
          });
        }
      })}
    </group>
  );
}
