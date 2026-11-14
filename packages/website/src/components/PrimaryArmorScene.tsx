import { memo, useRef } from "react";
import { Group } from "three";
import { nameToArmorId } from "../core/blitzkit/nameToArmorId";
import { resolveArmor } from "../core/blitzkit/resolveThickness";
import { useArmor } from "../hooks/useArmor";
import { useConsumable } from "../hooks/useConsumable";
import { useDuelModels } from "../hooks/useDuelModels";
import { useDuelModules } from "../hooks/useDuelModules";
import { useTankTransform } from "../hooks/useTankTransform";
import { toThreeVector } from "../three/toThreeVector";
import { PrimaryArmorSceneComponent } from "./PrimaryArmorSceneComponent";

export const PrimaryArmorScene = memo(() => {
  const turretContainer = useRef<Group>(null!);
  const gunContainer = useRef<Group>(null!);
  const protagonist = useDuelModules("protagonist");
  const armorGltf = useArmor(protagonist.tank.id).gltf;
  const armorNodes = Object.values(armorGltf.nodes);
  const models = useDuelModels("protagonist");
  const hullOrigin = toThreeVector(models.track.origin);
  const turretOrigin = toThreeVector(models.tank.turret_origin);
  const gunOrigin = toThreeVector(models.turret.gun_origin);
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
            spaced ||
            thickness === undefined ||
            (isDynamicArmorActive && node.name.includes("state_01")) ||
            (!isDynamicArmorActive && node.name.includes("state_00"))
          )
            return null;

          return (
            <PrimaryArmorSceneComponent
              key={node.uuid}
              thickness={thickness}
              node={node}
            />
          );
        })}
      </group>

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
            spaced ||
            thickness === undefined ||
            (isDynamicArmorActive && node.name.includes("state_01")) ||
            (!isDynamicArmorActive && node.name.includes("state_00"))
          )
            return null;

          return (
            <group position={hullOrigin} key={node.uuid}>
              <group position={turretOrigin}>
                <PrimaryArmorSceneComponent
                  key={node.uuid}
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
              spaced ||
              thickness === undefined ||
              (isDynamicArmorActive && node.name.includes("state_01")) ||
              (!isDynamicArmorActive && node.name.includes("state_00"))
            )
              return null;

            return (
              <group position={hullOrigin} key={node.uuid}>
                <group position={turretOrigin.clone().add(gunOrigin)}>
                  <PrimaryArmorSceneComponent
                    thickness={thickness}
                    node={node}
                  />
                </group>
              </group>
            );
          })}
        </group>
      </group>
    </>
  );
});
