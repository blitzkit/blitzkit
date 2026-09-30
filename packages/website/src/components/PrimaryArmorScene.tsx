import { memo, useRef } from "react";
import { Group } from "three";
import { correctZYTuple } from "../core/blitz/correctZYTuple";
import { nameToArmorId } from "../core/blitzkit/nameToArmorId";
import { resolveArmor } from "../core/blitzkit/resolveThickness";
import { useArmor } from "../hooks/useArmor";
import { useConsumable } from "../hooks/useConsumable";
import { DuelModule, useDuel } from "../hooks/useDuel";
import { useDuelModel } from "../hooks/useDuelModel";
import { useTankTransform } from "../hooks/useTankTransform";
import { PrimaryArmorSceneComponent } from "./PrimaryArmorSceneComponent";

export const PrimaryArmorScene = memo(() => {
  const turretContainer = useRef<Group>(null!);
  const gunContainer = useRef<Group>(null!);
  const tank = useDuel("protagonist", DuelModule.Tank);
  const track = useDuel("protagonist", DuelModule.Track);
  const turret = useDuel("protagonist", DuelModule.Turret);
  const gun = useDuel("protagonist", DuelModule.Gun);
  const armorGltf = useArmor(tank.id).gltf;
  const armorNodes = Object.values(armorGltf.nodes);
  const tankModelDefinition = useDuelModel("protagonist");
  const trackModelDefinition = tankModelDefinition.tracks[track.id];
  const turretModelDefinition = tankModelDefinition.turrets[turret.id];
  const gunModelDefinition = turretModelDefinition.guns[gun.id];
  const hullOrigin = correctZYTuple(trackModelDefinition.origin!);
  const turretOrigin = correctZYTuple(tankModelDefinition.turret_origin!);
  const gunOrigin = correctZYTuple(turretModelDefinition.gun_origin!);
  const isDynamicArmorActive = useConsumable("protagonist", 73);

  useTankTransform(track, turret, turretContainer, gunContainer);

  return (
    <>
      <group position={hullOrigin}>
        {armorNodes.map((node) => {
          const isHull = node.name.startsWith("hull_");
          const isVisible = isHull;
          const armorId = nameToArmorId(node.name);
          const { spaced, thickness } = resolveArmor(
            tankModelDefinition.armor!,
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
            `turret_${turretModelDefinition.model_id
              .toString()
              .padStart(2, "0")}`,
          );
          const isVisible = isCurrentTurret;
          const armorId = nameToArmorId(node.name);
          const { spaced, thickness } = resolveArmor(
            turretModelDefinition.armor!,
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
              `gun_${gunModelDefinition.model_id.toString().padStart(2, "0")}`,
            );
            const isVisible = isCurrentGun;
            const armorId = nameToArmorId(node.name);
            const { spaced, thickness } = resolveArmor(
              gunModelDefinition.armor!,
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
