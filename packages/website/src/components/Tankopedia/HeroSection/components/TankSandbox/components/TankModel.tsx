import { invalidate, useThree, type ThreeEvent } from "@react-three/fiber";
import { useRef } from "react";
import {
  Group,
  Material,
  Mesh,
  MeshStandardMaterial,
  Object3D,
  Vector2,
} from "three";
import { applyPitchYawLimits } from "../../../../../../core/blitz/applyPitchYawLimits";
import { hasEquipment } from "../../../../../../core/blitzkit/hasEquipment";
import { jsxTree } from "../../../../../../core/blitzkit/jsxTree";
import { modelTransformEvent } from "../../../../../../core/blitzkit/modelTransform";
import { controlsEnabledEvent } from "../../../../../../core/controlsEnabled";
import { useModel } from "../../../../../../hooks/useModel";
import { useSkin } from "../../../../../../hooks/useSkin";
import { useTankModelDefinition } from "../../../../../../hooks/useTankModelDefinition";
import { useTankTransform } from "../../../../../../hooks/useTankTransform";
import { Duel } from "../../../../../../stores/duel";
import { Tankopedia } from "../../../../../../stores/tankopedia";
import { TankopediaDisplay } from "../../../../../../stores/tankopediaPersistent/constants";
import { ModelTankWrapper } from "../../../../../Armor/components/ModelTankWrapper";

export function TankModel() {
  const protagonist = Duel.use((draft) => draft.protagonist);
  const track = Duel.use((state) => state.protagonist.track);
  const turret = Duel.use((state) => state.protagonist.turret);
  const canvas = useThree((state) => state.gl.domElement);
  const hullContainer = useRef<Group>(null);
  const turretContainer = useRef<Group>(null!);
  const gunContainer = useRef<Group>(null!);
  const tankModelDefinition = useTankModelDefinition();
  const turretModelDefinition =
    tankModelDefinition.turrets[protagonist.turret.id];
  const gunModelDefinition = turretModelDefinition.guns[protagonist.gun.id];
  const { gltf } = useModel(protagonist.tank.id);
  const nodes = Object.values(gltf.nodes);
  const skin = Tankopedia.use((state) => state.skin);
  const skinGltf = useSkin(protagonist.tank.id, skin);
  const skinNodes = new Map(
    skinGltf?.scene.children.map((node) => [node.name, node]),
  );

  useTankTransform(track, turret, turretContainer, gunContainer);

  function skinTree(node: Object3D, mergers: Parameters<typeof jsxTree>[1]) {
    const skinMergers: Parameters<typeof jsxTree>[1] = {
      mesh(mesh, props, key) {
        const material = skinGltf?.materials.get(
          (mesh.material as Material).name,
        );

        return mergers!.mesh!(
          mesh,
          material ? { ...props, material } : props,
          key,
        );
      },
      group(object3d, props, key) {
        const skinNode = skinNodes.get(object3d.name);
        const isSwitch = object3d.userData.state !== undefined;
        const state = skinGltf
          ? skinGltf.scene.userData.states[object3d.name]
          : object3d.userData.state;

        return (
          <group key={key} {...props}>
            {isSwitch
              ? object3d.children
                  .filter((child) => child.name === state)
                  .map((child) => jsxTree(child, skinMergers))
              : props.children}
            {skinNode?.children.map((child) => jsxTree(child, mergers))}
          </group>
        );
      },
    };

    return jsxTree(node, skinMergers);
  }

  return (
    <ModelTankWrapper ref={hullContainer}>
      {nodes.map((node) => {
        const isHull = node.name === "hull";
        const isWheel = node.name.startsWith("chassis_wheel_");
        const isTrack = node.name.startsWith("chassis_track_");
        const isVisible = isHull || isWheel || isTrack;
        const position = new Vector2();
        const delta = new Vector2();

        if (!isVisible) return null;

        function translateTexture(offset: number) {
          const mesh = node.children[0] as Mesh;
          const material = mesh?.material as MeshStandardMaterial;

          if (!material) return;

          invalidate();

          const textures = new Set([
            material.map,
            material.aoMap,
            material.normalMap,
            material.roughnessMap,
            material.metalnessMap,
          ]);

          for (const texture of textures) {
            if (texture) texture.offset.y += offset;
          }
        }

        function onPointerDown(event: ThreeEvent<PointerEvent>) {
          if (isTrack && Tankopedia.state.display === TankopediaDisplay.Model) {
            position.set(event.clientX, event.clientY);
            event.stopPropagation();

            controlsEnabledEvent.dispatch(false);

            window.addEventListener("pointermove", handlePointerMove);
            window.addEventListener("pointerup", handlePointerUp);
          } else {
            event.stopPropagation();
          }
        }
        function handlePointerMove(event: PointerEvent) {
          delta.set(event.clientX, event.clientY).sub(position);
          position.set(event.clientX, event.clientY);
          const deltaX = delta.x / window.innerWidth;
          const deltaY = delta.y / window.innerHeight;

          translateTexture(deltaX + deltaY);
        }
        function handlePointerUp() {
          controlsEnabledEvent.dispatch(true);

          window.removeEventListener("pointermove", handlePointerMove);
          window.removeEventListener("pointerup", handlePointerUp);
        }

        return skinTree(node, {
          mesh(_, props, key) {
            return (
              <mesh
                {...props}
                key={key}
                onPointerDown={onPointerDown}
                castShadow
                receiveShadow
              />
            );
          },
        });
      })}

      <group ref={turretContainer}>
        {nodes.map((node) => {
          const isTurret = node.name.startsWith("turret_");
          const isCurrentTurret =
            node.name ===
            `turret_${turretModelDefinition.model_id
              .toString()
              .padStart(2, "0")}`;
          const isVisible = isCurrentTurret;
          const position = new Vector2();
          const delta = new Vector2();

          if (!isVisible) return null;

          function onPointerDown(event: ThreeEvent<PointerEvent>) {
            event.stopPropagation();

            if (!isTurret) return;

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
            const hasImprovedVerticalStabilizer = hasEquipment(
              122,
              Duel.state.protagonist.tank.equipment_preset,
              Duel.state.protagonist.equipmentMatrix,
            );
            const hasDownImprovedVerticalStabilizer = hasEquipment(
              124,
              Duel.state.protagonist.tank.equipment_preset,
              Duel.state.protagonist.equipmentMatrix,
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

          return skinTree(node, {
            mesh(_, props, key) {
              return (
                <mesh
                  {...props}
                  key={key}
                  onPointerDown={onPointerDown}
                  castShadow
                  receiveShadow
                />
              );
            },
          });
        })}

        <group ref={gunContainer}>
          {nodes.map((node) => {
            const isCurrentMantlet =
              node.name ===
              `gun_${gunModelDefinition.model_id
                .toString()
                .padStart(2, "0")}_mask`;
            const isCurrentGun =
              node.name ===
              `gun_${gunModelDefinition.model_id.toString().padStart(2, "0")}`;
            const isVisible = isCurrentGun || isCurrentMantlet;
            const position = new Vector2();
            const delta = new Vector2();

            if (!isVisible) return null;

            let pitch = 0;
            let yaw = 0;

            function onPointerDown(event: ThreeEvent<PointerEvent>) {
              event.stopPropagation();

              controlsEnabledEvent.dispatch(false);
              Tankopedia.mutate((draft) => {
                draft.shot = undefined;
                draft.highlightArmor = undefined;
              });

              position.set(event.clientX, event.clientY);
              pitch = modelTransformEvent.last!.pitch;
              yaw = modelTransformEvent.last!.yaw;

              window.addEventListener("pointermove", handlePointerMove);
              window.addEventListener("pointerup", handlePointerUp);
            }
            function handlePointerMove(event: PointerEvent) {
              const hasImprovedVerticalStabilizer = hasEquipment(
                122,
                Duel.state.protagonist.tank.equipment_preset,
                Duel.state.protagonist.equipmentMatrix,
              );
              const hasDownImprovedVerticalStabilizer = hasEquipment(
                124,
                Duel.state.protagonist.tank.equipment_preset,
                Duel.state.protagonist.equipmentMatrix,
              );
              const boundingRect = canvas.getBoundingClientRect();
              delta.set(event.clientX, event.clientY).sub(position);
              position.set(event.clientX, event.clientY);

              [pitch, yaw] = applyPitchYawLimits(
                pitch - delta.y * (Math.PI / boundingRect.height),
                yaw + delta.x * (Math.PI / boundingRect.width),
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

            return skinTree(node, {
              mesh(_, props, key) {
                return (
                  <mesh
                    {...props}
                    key={key}
                    onPointerDown={onPointerDown}
                    castShadow
                    receiveShadow
                  />
                );
              },
            });
          })}
        </group>
      </group>
    </ModelTankWrapper>
  );
}
