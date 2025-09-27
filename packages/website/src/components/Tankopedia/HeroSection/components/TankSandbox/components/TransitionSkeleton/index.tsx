import { useRef } from "react";
import { Group, ShaderMaterial, UniformsLib, UniformsUtils } from "three";
import { correctZYTuple } from "../../../../../../../core/blitz/correctZYTuple";
import { jsxTree } from "../../../../../../../core/blitzkit/jsxTree";
import { useArmor } from "../../../../../../../hooks/useArmor";
import { useModel } from "../../../../../../../hooks/useModel";
import { useTankModelDefinition } from "../../../../../../../hooks/useTankModelDefinition";
import { useTankTransform } from "../../../../../../../hooks/useTankTransform";
import { Duel } from "../../../../../../../stores/duel";
import { ModelTankWrapper } from "../../../../../../Armor/components/ModelTankWrapper";
import fragmentShader from "./shaders/fragment.glsl?raw";
import vertexShader from "./shaders/vertex.glsl?raw";

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
  const tank = Duel.use((state) => state.protagonist.tank);
  const gun = Duel.use((state) => state.protagonist.gun);
  const track = Duel.use((state) => state.protagonist.track);
  const turret = Duel.use((state) => state.protagonist.turret);
  const turretContainer = useRef<Group>(null!);
  const gunContainer = useRef<Group>(null!);
  const { gltf: armorGltf } = useArmor(tank.id);
  const { gltf: modelGltf } = useModel(tank.id);
  const modelNodes = Object.values(modelGltf.nodes);
  const armorNodes = Object.values(armorGltf.nodes);
  const tankModelDefinition = useTankModelDefinition();
  const turretModelDefinition = tankModelDefinition.turrets[turret.id];
  const gunModelDefinition = turretModelDefinition.guns[gun.id];
  const trackModelDefinition = tankModelDefinition.tracks[track.id];
  const wrapper = useRef<Group>(null);
  const hullOrigin = correctZYTuple(trackModelDefinition.origin);
  const turretOrigin = correctZYTuple(tankModelDefinition.turret_origin);
  const gunOrigin = correctZYTuple(turretModelDefinition.gun_origin);

  useTankTransform(track, turret, turretContainer, gunContainer);

  return (
    <ModelTankWrapper ref={wrapper}>
      <group position={hullOrigin}>
        {armorNodes.map((node) => {
          const isHull = node.name.startsWith("hull_");
          const isVisible = isHull;

          if (!isVisible) return null;

          return jsxTree(node, {
            mesh(_, props, key) {
              return <mesh {...props} key={key} material={skeletonMaterial} />;
            },
          });
        })}
      </group>

      {modelNodes.map((node) => {
        const isWheel = node.name.startsWith("chassis_wheel_");
        const isTrack = node.name.startsWith("chassis_track_");
        const isVisible = isWheel || isTrack;

        if (!isVisible) return null;

        return jsxTree(node, {
          mesh(_, props, key) {
            return <mesh {...props} key={key} material={skeletonMaterial} />;
          },
        });
      })}

      <group ref={turretContainer}>
        {armorNodes.map((node) => {
          const isCurrentTurret = node.name.startsWith(
            `turret_${turretModelDefinition.model_id.toString().padStart(2, "0")}`
          );
          const isVisible = isCurrentTurret;
          if (!isVisible) {
            return null;
          }

          return (
            <group key={node.uuid} position={hullOrigin}>
              <group position={turretOrigin}>
                {jsxTree(node, {
                  mesh(_, props, key) {
                    return (
                      <mesh {...props} key={key} material={skeletonMaterial} />
                    );
                  },
                })}
              </group>
            </group>
          );
        })}

        <group ref={gunContainer}>
          {armorNodes.map((node) => {
            const isCurrentGun = node.name.startsWith(
              `gun_${gunModelDefinition.model_id.toString().padStart(2, "0")}`
            );
            const isVisible = isCurrentGun;

            if (!isVisible) return null;

            return (
              <group key={node.uuid} position={hullOrigin}>
                <group position={turretOrigin.clone().add(gunOrigin)}>
                  {jsxTree(node, {
                    mesh(_, props, key) {
                      return (
                        <mesh
                          {...props}
                          key={key}
                          material={skeletonMaterial}
                        />
                      );
                    },
                  })}
                </group>
              </group>
            );
          })}

          {modelNodes.map((node) => {
            const gunString = `gun_${gunModelDefinition.model_id
              .toString()
              .padStart(2, "0")}`;
            const isCurrentGun = gunModelDefinition.mask
              ? node.name.startsWith(gunString)
              : node.name === gunString;
            const isVisible = isCurrentGun;

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
