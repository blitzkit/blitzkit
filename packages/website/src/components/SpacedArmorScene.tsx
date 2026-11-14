import { memo, useRef } from "react";
import { Group, Plane, Scene, Vector3 } from "three";
import { nameToArmorId } from "../core/blitzkit/nameToArmorId";
import { resolveArmor } from "../core/blitzkit/resolveThickness";
import { useArmor } from "../hooks/useArmor";
import { useConsumable } from "../hooks/useConsumable";
import { useDuelModels } from "../hooks/useDuelModels";
import { useDuelModules } from "../hooks/useDuelModules";
import { useModel } from "../hooks/useModel";
import { useTankTransform } from "../hooks/useTankTransform";
import { toThreeVector } from "../three/toThreeVector";
import { SpacedArmorSceneComponent } from "./SpacedArmorSceneComponent";

export enum ArmorType {
  Primary,
  Spaced,
  External,
}

interface SpacedArmorSceneProps {
  scene: Scene;
}

export const SpacedArmorScene = memo<SpacedArmorSceneProps>(({ scene }) => {
  const turretContainer = useRef<Group>(null!);
  const gunContainer = useRef<Group>(null!);
  const protagonist = useDuelModules("protagonist");
  const { gltf: armorGltf } = useArmor(protagonist.tank.id);
  const { gltf: modelGltf } = useModel(protagonist.tank.id);
  const armorNodes = Object.values(armorGltf.nodes);
  const modelNodes = Object.values(modelGltf.nodes);
  const models = useDuelModels("protagonist");
  const hullOrigin = toThreeVector(models.track.origin);
  const turretOrigin = toThreeVector(models.tank.turret_origin);
  const gunOrigin = toThreeVector(models.turret.gun_origin);
  const maskOrigin =
    models.gun.mask === undefined
      ? undefined
      : models.gun.mask + hullOrigin.y + turretOrigin.y + gunOrigin.y;
  const isDynamicArmorActive = useConsumable("protagonist", 73);

  useTankTransform(
    protagonist.track,
    protagonist.turret,
    turretContainer,
    gunContainer,
  );

  return (
    <>
      <group position={hullOrigin}>
        {armorNodes.map((node) => {
          const isHull = node.name.startsWith("hull_");
          const isVisible = isHull;
          const armorId = nameToArmorId(node.name);
          const { spaced, thickness } = resolveArmor(
            models.tank.armor!,
            armorId,
          );

          if (
            !isVisible ||
            thickness === undefined ||
            (isDynamicArmorActive && node.name.includes("state_00")) ||
            (!isDynamicArmorActive && node.name.includes("state_01"))
          )
            return null;

          return (
            <SpacedArmorSceneComponent
              scene={scene}
              key={`${node.uuid}-hull`}
              type={spaced ? ArmorType.Spaced : ArmorType.Primary}
              thickness={thickness}
              node={node}
            />
          );
        })}
      </group>

      {modelNodes.map((node) => {
        const isWheel = node.name.startsWith("chassis_wheel_");
        const isTrack = node.name.startsWith("chassis_track_");
        const isVisible = isWheel || isTrack;

        if (!isVisible) return null;

        return (
          <SpacedArmorSceneComponent
            scene={scene}
            key={`${node.uuid}-track`}
            type={ArmorType.External}
            thickness={models.track.thickness}
            variant="track"
            node={node}
          />
        );
      })}

      <group ref={turretContainer}>
        {armorNodes.map((node) => {
          const isCurrentTurret = node.name.startsWith(
            `turret_${models.turret.model_id.toString().padStart(2, "0")}`,
          );
          const isVisible = isCurrentTurret;
          const armorId = nameToArmorId(node.name);
          const { spaced, thickness } = resolveArmor(
            models.turret.armor!,
            armorId,
          );

          if (
            !isVisible ||
            thickness === undefined ||
            (isDynamicArmorActive && node.name.includes("state_00")) ||
            (!isDynamicArmorActive && node.name.includes("state_01"))
          )
            return null;

          return (
            <group position={hullOrigin} key={node.uuid}>
              <group position={turretOrigin}>
                <SpacedArmorSceneComponent
                  scene={scene}
                  key={`${node.uuid}-turret`}
                  type={spaced ? ArmorType.Spaced : ArmorType.Primary}
                  thickness={thickness}
                  node={node}
                />
              </group>
            </group>
          );
        })}

        <group ref={gunContainer}>
          {armorNodes.map((node) => {
            const isCurrentGun = node.name.startsWith(
              `gun_${models.gun.model_id.toString().padStart(2, "0")}`,
            );
            const isVisible = isCurrentGun;
            const armorId = nameToArmorId(node.name);
            const { spaced, thickness } = resolveArmor(
              models.gun.armor!,
              armorId,
            );

            if (
              !isVisible ||
              thickness === undefined ||
              (isDynamicArmorActive && node.name.includes("state_00")) ||
              (!isDynamicArmorActive && node.name.includes("state_01"))
            )
              return null;

            return (
              <group position={hullOrigin} key={`${node.uuid}-gun-spaced}`}>
                <group position={turretOrigin.clone().add(gunOrigin)}>
                  <SpacedArmorSceneComponent
                    scene={scene}
                    type={spaced ? ArmorType.Spaced : ArmorType.Primary}
                    thickness={thickness}
                    node={node}
                  />
                </group>
              </group>
            );
          })}

          {modelNodes.map((node) => {
            const gunString = `gun_${models.gun.model_id
              .toString()
              .padStart(2, "0")}`;
            const isCurrentGun = models.gun.mask
              ? node.name.startsWith(gunString)
              : node.name === gunString;
            const isVisible = isCurrentGun;

            if (!isVisible) return null;

            return (
              <SpacedArmorSceneComponent
                scene={scene}
                key={`${node.uuid}-gun-external`}
                type={ArmorType.External}
                thickness={models.gun.thickness}
                variant="gun"
                node={node}
                clip={
                  maskOrigin === undefined
                    ? undefined
                    : new Plane(new Vector3(0, 0, -1), -maskOrigin)
                }
              />
            );
          })}
        </group>
      </group>
    </>
  );
});
