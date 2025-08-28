import { Vector3 } from 'three';
import { awaitableModelDefinitions } from '../../../core/awaitables/modelDefinitions';
import { jsxTree } from '../../../core/blitzkit/jsxTree';
import { useModel } from '../../../hooks/useModel';
import { MixerEphemeral } from '../../../stores/mixerEphemeral';

const modelDefinitions = await awaitableModelDefinitions;

export function Model() {
  const hull = MixerEphemeral.use((state) => state.hull);
  const turret = MixerEphemeral.use((state) => state.turret);
  const gun = MixerEphemeral.use((state) => state.gun);

  const hullGltf = useModel(hull.id);
  const turretGltf = useModel(turret.tank.id);
  const gunGltf = useModel(gun.tank.id);

  const hullNodes = Object.values(hullGltf.gltf.nodes);
  const turretNodes = Object.values(turretGltf.gltf.nodes);
  const gunNodes = Object.values(gunGltf.gltf.nodes);

  const tankModel = modelDefinitions.models[hull.id];
  const trackModel = tankModel.tracks[hull.tracks.at(-1)!.id];

  const turretTankModel = modelDefinitions.models[turret.tank.id];
  const turretTrackModel =
    turretTankModel.tracks[turret.tank.tracks.at(-1)!.id];
  const turretModel = turretTankModel.turrets[turret.turret.id];

  const gunTankModel = modelDefinitions.models[gun.tank.id];
  const gunTrackModel = gunTankModel.tracks[gun.tank.tracks.at(-1)!.id];
  const gunTurretModel = gunTankModel.turrets[gun.turret.id];
  const gunModel = gunTurretModel.guns[gun.gun.id];

  const turretDelta = new Vector3(
    tankModel.turret_origin.x - turretTankModel.turret_origin.x,
    tankModel.turret_origin.y - turretTankModel.turret_origin.y,
    tankModel.turret_origin.z - turretTankModel.turret_origin.z,
  );
  const gunDelta = new Vector3(
    turretModel.gun_origin.x - gunTurretModel.gun_origin.x,
    turretModel.gun_origin.z - gunTurretModel.gun_origin.z,
    turretModel.gun_origin.y - gunTurretModel.gun_origin.y,
  );

  return (
    <group rotation={[-Math.PI / 2, 0, 0]}>
      {hullNodes.map((node) => {
        const isHull = node.name === 'hull';
        const isWheel = node.name.startsWith('chassis_wheel_');
        const isTrack = node.name.startsWith('chassis_track_');
        const isVisible = isHull || isWheel || isTrack;

        if (!isVisible) return null;

        return jsxTree(node, {
          mesh(_, props, key) {
            return <mesh {...props} key={key} />;
          },
        });
      })}

      <group
        position={[
          tankModel.turret_origin.x +
            trackModel.origin.x -
            turretTankModel.turret_origin.x -
            turretTrackModel.origin.x,
          tankModel.turret_origin.z +
            trackModel.origin.z -
            turretTankModel.turret_origin.z -
            turretTrackModel.origin.z,
          tankModel.turret_origin.y +
            trackModel.origin.y -
            turretTankModel.turret_origin.y -
            turretTrackModel.origin.y,
        ]}
      >
        {turretNodes.map((node) => {
          const isCurrentTurret =
            node.name ===
            `turret_${turretModel.model_id.toString().padStart(2, '0')}`;
          const isVisible = isCurrentTurret;

          if (!isVisible) return null;

          return jsxTree(node, {
            mesh(_, props, key) {
              return <mesh {...props} key={key} />;
            },
          });
        })}

        <group
          position={[
            turretTankModel.turret_origin.x +
              turretTrackModel.origin.x +
              turretModel.gun_origin.x -
              gunTankModel.turret_origin.x -
              gunTrackModel.origin.x -
              gunTurretModel.gun_origin.x,
            turretTankModel.turret_origin.z +
              turretTrackModel.origin.z +
              turretModel.gun_origin.z -
              gunTankModel.turret_origin.z -
              gunTrackModel.origin.z -
              gunTurretModel.gun_origin.z,
            turretTankModel.turret_origin.y +
              turretTrackModel.origin.y +
              turretModel.gun_origin.y -
              gunTankModel.turret_origin.y -
              gunTrackModel.origin.y -
              gunTurretModel.gun_origin.y,
          ]}
        >
          {gunNodes.map((node) => {
            const isCurrentMantlet =
              node.name ===
              `gun_${gunModel.model_id.toString().padStart(2, '0')}_mask`;
            const isCurrentGun =
              node.name ===
              `gun_${gunModel.model_id.toString().padStart(2, '0')}`;
            const isVisible = isCurrentGun || isCurrentMantlet;

            if (!isVisible) return null;

            return jsxTree(node, {
              mesh(_, props, key) {
                return <mesh {...props} key={key} />;
              },
            });
          })}
        </group>
      </group>
    </group>
  );
}
