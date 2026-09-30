import { useThree, type ThreeEvent } from "@react-three/fiber";
import { memo, useRef } from "react";
import { Group, Plane, Vector2, Vector3 } from "three";
import { applyPitchYawLimits } from "../core/blitz/applyPitchYawLimits";
import { correctZYTuple } from "../core/blitz/correctZYTuple";
import { modelTransformEvent } from "../core/blitzkit/modelTransform";
import { nameToArmorId } from "../core/blitzkit/nameToArmorId";
import { resolveArmor } from "../core/blitzkit/resolveThickness";
import { controlsEnabledEvent } from "../core/controlsEnabled";
import { useArmor } from "../hooks/useArmor";
import { useConsumable } from "../hooks/useConsumable";
import { DuelModule, getDuel, useDuel } from "../hooks/useDuel";
import { useDuelModel } from "../hooks/useDuelModel";
import { hasEquipment } from "../hooks/useEquipment";
import { useModel } from "../hooks/useModel";
import { useTankTransform } from "../hooks/useTankTransform";
import { Tankopedia } from "../stores/tankopedia";
import { TankopediaPersistent } from "../stores/tankopediaPersistent";
import { ArmorType } from "./SpacedArmorScene";
import { StaticArmorSceneComponent } from "./StaticArmorSceneComponent";

interface ArmorSceneProps {
  thicknessRange: ThicknessRange;
}

export interface ThicknessRange {
  value: number;
}

export const StaticArmor = memo<ArmorSceneProps>(({ thicknessRange }) => {
  const turretContainer = useRef<Group>(null!);
  const gunContainer = useRef<Group>(null!);

  const tank = useDuel("protagonist", DuelModule.Tank);
  const track = useDuel("protagonist", DuelModule.Track);
  const turret = useDuel("protagonist", DuelModule.Turret);
  const gun = useDuel("protagonist", DuelModule.Gun);

  const { gltf: armorGltf } = useArmor(tank.id);
  const { gltf: modelGltf } = useModel(tank.id);
  const armorNodes = Object.values(armorGltf.nodes);
  const modelNodes = Object.values(modelGltf.nodes);
  const tankModelDefinition = useDuelModel("protagonist");
  const trackModelDefinition = tankModelDefinition.tracks[track.id];
  const turretModelDefinition = tankModelDefinition.turrets[turret.id];
  const gunModelDefinition = turretModelDefinition.guns[gun.id];
  const hullOrigin = correctZYTuple(trackModelDefinition.origin!);
  const turretOrigin = correctZYTuple(tankModelDefinition.turret_origin!);
  const gunOrigin = correctZYTuple(turretModelDefinition.gun_origin!);
  const canvas = useThree((state) => state.gl.domElement);

  const maskOrigin =
    gunModelDefinition.mask === undefined
      ? undefined
      : gunModelDefinition.mask + hullOrigin.y + turretOrigin.y + gunOrigin.y;
  const showPrimaryArmor = TankopediaPersistent.use(
    (state) => state.showPrimaryArmor,
  );
  const showSpacedArmor = TankopediaPersistent.use(
    (state) => state.showSpacedArmor,
  );
  const showExternalModules = TankopediaPersistent.use(
    (state) => state.showExternalModules,
  );
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
            thickness === undefined ||
            (!showPrimaryArmor && !spaced) ||
            (!showSpacedArmor && spaced) ||
            (isDynamicArmorActive && node.name.includes("state_00")) ||
            (!isDynamicArmorActive && node.name.includes("state_01"))
          )
            return null;

          return (
            <StaticArmorSceneComponent
              name={node.name}
              thicknessRange={thicknessRange}
              key={node.uuid}
              type={spaced ? ArmorType.Spaced : ArmorType.Primary}
              thickness={thickness}
              node={node}
              onPointerDown={(event) => event.stopPropagation()}
            />
          );
        })}
      </group>

      {modelNodes.map((node) => {
        const isWheel = node.name.startsWith("chassis_wheel_");
        const isTrack = node.name.startsWith("chassis_track_");
        const isVisible = isWheel || isTrack;

        if (!isVisible || !showExternalModules) return null;

        return (
          <StaticArmorSceneComponent
            name={node.name}
            thicknessRange={thicknessRange}
            key={node.uuid}
            type={ArmorType.External}
            thickness={trackModelDefinition.thickness}
            variant="track"
            node={node}
            onPointerDown={(event) => event.stopPropagation()}
          />
        );
      })}

      <group ref={turretContainer}>
        {armorNodes.map((node) => {
          const isCurrentTurret = node.name.startsWith(
            `turret_${turretModelDefinition.model_id.toString().padStart(2, "0")}`,
          );
          const isVisible = isCurrentTurret;
          const armorId = nameToArmorId(node.name);
          const { spaced, thickness } = resolveArmor(
            turretModelDefinition.armor!,
            armorId,
          );

          if (
            !isVisible ||
            thickness === undefined ||
            (!showPrimaryArmor && !spaced) ||
            (!showSpacedArmor && spaced) ||
            (isDynamicArmorActive && node.name.includes("state_00")) ||
            (!isDynamicArmorActive && node.name.includes("state_01"))
          ) {
            return null;
          }

          const position = new Vector2();
          const delta = new Vector2();

          function onPointerDown(event: ThreeEvent<PointerEvent>) {
            event.stopPropagation();

            position.set(event.clientX, event.clientY);

            controlsEnabledEvent.dispatch(false);

            Tankopedia.mutate((draft) => {
              draft.shot = undefined;
              draft.highlightArmor = undefined;
            });
            window.addEventListener("pointermove", handlePointerMove);
            window.addEventListener("pointerup", handlePointerUp);
          }
          function handlePointerMove(event: PointerEvent) {
            const protagonist = getDuel("protagonist", DuelModule.Tank);

            const hasImprovedVerticalStabilizer = hasEquipment(
              122,
              protagonist.equipment_preset,
              Tankopedia.state.protagonist.equipment,
            );
            const hasDownImprovedVerticalStabilizer = hasEquipment(
              124,
              protagonist.equipment_preset,
              Tankopedia.state.protagonist.equipment,
            );
            const boundingRect = canvas.getBoundingClientRect();

            delta.set(event.clientX, event.clientY).sub(position);
            position.set(event.clientX, event.clientY);

            const [pitch, yaw] = applyPitchYawLimits(
              modelTransformEvent.last!.pitch,
              modelTransformEvent.last!.yaw +
                delta.x * (Math.PI / boundingRect.width),
              gunModelDefinition.pitch!,
              turretModelDefinition.yaw,
              hasImprovedVerticalStabilizer,
              hasDownImprovedVerticalStabilizer,
            );
            modelTransformEvent.dispatch({ pitch, yaw });
          }
          function handlePointerUp() {
            controlsEnabledEvent.dispatch(true);
            window.removeEventListener("pointermove", handlePointerMove);
            window.removeEventListener("pointerup", handlePointerUp);
          }

          return (
            <group key={node.uuid} position={hullOrigin}>
              <group position={turretOrigin}>
                <StaticArmorSceneComponent
                  name={node.name}
                  thicknessRange={thicknessRange}
                  type={spaced ? ArmorType.Spaced : ArmorType.Primary}
                  thickness={thickness}
                  node={node}
                  onPointerDown={onPointerDown}
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
              thickness === undefined ||
              (!showPrimaryArmor && !spaced) ||
              (!showSpacedArmor && spaced) ||
              (isDynamicArmorActive && node.name.includes("state_00")) ||
              (!isDynamicArmorActive && node.name.includes("state_01"))
            )
              return null;

            const position = new Vector2();
            const delta = new Vector2();

            function onPointerDown(event: ThreeEvent<PointerEvent>) {
              event.stopPropagation();

              controlsEnabledEvent.dispatch(false);
              Tankopedia.mutate((draft) => {
                draft.shot = undefined;
                draft.highlightArmor = undefined;
              });

              position.set(event.clientX, event.clientY);

              window.addEventListener("pointermove", handlePointerMove);
              window.addEventListener("pointerup", handlePointerUp);
            }
            function handlePointerMove(event: PointerEvent) {
              const protagonist = getDuel("protagonist", DuelModule.Tank);

              const hasImprovedVerticalStabilizer = hasEquipment(
                122,
                protagonist.equipment_preset,
                Tankopedia.state.protagonist.equipment,
              );
              const hasDownImprovedVerticalStabilizer = hasEquipment(
                124,
                protagonist.equipment_preset,
                Tankopedia.state.protagonist.equipment,
              );
              const boundingRect = canvas.getBoundingClientRect();
              delta.set(event.clientX, event.clientY).sub(position);
              position.set(event.clientX, event.clientY);

              const [pitch, yaw] = applyPitchYawLimits(
                modelTransformEvent.last!.pitch -
                  delta.y * (Math.PI / boundingRect.height),
                modelTransformEvent.last!.yaw +
                  delta.x * (Math.PI / boundingRect.width),
                gunModelDefinition.pitch!,
                turretModelDefinition.yaw,
                hasImprovedVerticalStabilizer,
                hasDownImprovedVerticalStabilizer,
              );
              modelTransformEvent.dispatch({ pitch, yaw });
            }
            function handlePointerUp() {
              controlsEnabledEvent.dispatch(true);
              window.removeEventListener("pointermove", handlePointerMove);
              window.removeEventListener("pointerup", handlePointerUp);
            }

            return (
              <group key={node.uuid} position={hullOrigin}>
                <group position={turretOrigin.clone().add(gunOrigin)}>
                  <StaticArmorSceneComponent
                    name={node.name}
                    thicknessRange={thicknessRange}
                    type={spaced ? ArmorType.Spaced : ArmorType.Primary}
                    thickness={thickness}
                    node={node}
                    onPointerDown={onPointerDown}
                  />
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

            if (!isVisible || !showExternalModules) return null;

            const position = new Vector2();
            const delta = new Vector2();

            function onPointerDown(event: ThreeEvent<PointerEvent>) {
              event.stopPropagation();

              controlsEnabledEvent.dispatch(false);
              Tankopedia.mutate((draft) => {
                draft.shot = undefined;
                draft.highlightArmor = undefined;
              });

              position.set(event.clientX, event.clientY);
              window.addEventListener("pointermove", handlePointerMove);
              window.addEventListener("pointerup", handlePointerUp);
            }
            function handlePointerMove(event: PointerEvent) {
              const protagonist = getDuel("protagonist", DuelModule.Tank);

              const hasImprovedVerticalStabilizer = hasEquipment(
                122,
                protagonist.equipment_preset,
                Tankopedia.state.protagonist.equipment,
              );
              const hasDownImprovedVerticalStabilizer = hasEquipment(
                124,
                protagonist.equipment_preset,
                Tankopedia.state.protagonist.equipment,
              );
              const boundingRect = canvas.getBoundingClientRect();
              delta.set(event.clientX, event.clientY).sub(position);
              position.set(event.clientX, event.clientY);

              const [pitch, yaw] = applyPitchYawLimits(
                modelTransformEvent.last!.pitch -
                  delta.y * (Math.PI / boundingRect.height),
                modelTransformEvent.last!.yaw +
                  delta.x * (Math.PI / boundingRect.width),
                gunModelDefinition.pitch!,
                turretModelDefinition.yaw,
                hasImprovedVerticalStabilizer,
                hasDownImprovedVerticalStabilizer,
              );
              modelTransformEvent.dispatch({ pitch, yaw });
            }
            function handlePointerUp() {
              controlsEnabledEvent.dispatch(true);

              window.removeEventListener("pointermove", handlePointerMove);
              window.removeEventListener("pointerup", handlePointerUp);
            }

            return (
              <StaticArmorSceneComponent
                name={node.name}
                thicknessRange={thicknessRange}
                key={node.uuid}
                type={ArmorType.External}
                thickness={gunModelDefinition.thickness}
                variant="gun"
                node={node}
                clip={
                  maskOrigin === undefined
                    ? undefined
                    : new Plane(new Vector3(0, 0, -1), -maskOrigin)
                }
                hullOrigin={hullOrigin}
                turretOrigin={turretOrigin}
                gunOrigin={gunOrigin}
                onPointerDown={onPointerDown}
              />
            );
          })}
        </group>
      </group>
    </>
  );
});
