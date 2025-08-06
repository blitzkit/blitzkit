import { useRef } from 'react';
import { Group, ShaderMaterial, UniformsLib, UniformsUtils } from 'three';
import { jsxTree } from '../../../../../../../core/blitzkit/jsxTree';
import { useModel } from '../../../../../../../hooks/useModel';
import { useTankModelDefinition } from '../../../../../../../hooks/useTankModelDefinition';
import { useTankTransform } from '../../../../../../../hooks/useTankTransform';
import { Duel } from '../../../../../../../stores/duel';
import { TankopediaEphemeral } from '../../../../../../../stores/tankopediaEphemeral';
import { ModelTankWrapper } from '../../../../../../Armor/components/ModelTankWrapper';
import fragmentShader from './shaders/fragment.glsl?raw';
import vertexShader from './shaders/vertex.glsl?raw';

const skeletonMaterial = new ShaderMaterial({
  vertexShader,
  fragmentShader,
  wireframe: true,
  fog: true,
  transparent: true,
  uniforms: UniformsUtils.merge([UniformsLib.common, UniformsLib.fog]),
  depthWrite: false,
});

export function TransitionSkeleton() {
  const protagonist = Duel.use((draft) => draft.protagonist);
  const tankopediaEphemeralStore = TankopediaEphemeral.useStore();
  const track = Duel.use((state) => state.protagonist.track);
  const turret = Duel.use((state) => state.protagonist.turret);
  const hullContainer = useRef<Group>(null);
  const turretContainer = useRef<Group>(null);
  const gunContainer = useRef<Group>(null);
  const tankModelDefinition = useTankModelDefinition();
  const turretModelDefinition =
    tankModelDefinition.turrets[protagonist.turret.id];
  const gunModelDefinition =
    turretModelDefinition.guns[protagonist.gun.gun_type!.value.base.id];
  const { gltf } = useModel(protagonist.tank.id);
  const nodes = Object.values(gltf.nodes);
  const revealed = tankopediaEphemeralStore((state) => state.revealed);

  useTankTransform(track, turret, turretContainer, gunContainer);

  return (
    <ModelTankWrapper ref={hullContainer} visible={revealed}>
      {nodes.map((node) => {
        const isHull = node.name === 'hull';
        const isWheel = node.name.startsWith('chassis_wheel_');
        const isTrack = node.name.startsWith('chassis_track_');
        const isVisible = isHull || isWheel || isTrack;

        if (!isVisible) return null;

        return jsxTree(node, {
          mesh(_, props, key) {
            return <mesh {...props} key={key} material={skeletonMaterial} />;
          },
        });
      })}

      <group ref={turretContainer}>
        {nodes.map((node) => {
          const isCurrentTurret =
            node.name ===
            `turret_${turretModelDefinition.model_id.toString().padStart(2, '0')}`;
          const isVisible = isCurrentTurret;

          if (!isVisible) return null;

          return jsxTree(node, {
            mesh(_, props, key) {
              return <mesh {...props} key={key} material={skeletonMaterial} />;
            },
          });
        })}

        <group ref={gunContainer}>
          {nodes.map((node) => {
            const isCurrentMantlet =
              node.name ===
              `gun_${gunModelDefinition.model_id
                .toString()
                .padStart(2, '0')}_mask`;
            const isCurrentGun =
              node.name ===
              `gun_${gunModelDefinition.model_id.toString().padStart(2, '0')}`;
            const isVisible = isCurrentGun || isCurrentMantlet;

            if (!isVisible) return null;

            return jsxTree(node, {
              mesh(_, props, key) {
                return (
                  <mesh {...props} key={key} material={skeletonMaterial} />
                );
              },
            });
          })}
        </group>
      </group>
    </ModelTankWrapper>
  );
}
