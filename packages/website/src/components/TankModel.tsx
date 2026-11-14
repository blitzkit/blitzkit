import { invalidate, useThree, type ThreeEvent } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import { Group, Mesh, MeshStandardMaterial, Vector2 } from "three";
import { applyPitchYawLimits } from "../core/blitz/applyPitchYawLimits";
import { modelTransformEvent } from "../core/blitzkit/modelTransform";
import { skinTree } from "../core/blitzkit/skinTree";
import { controlsEnabledEvent } from "../core/controlsEnabled";
import { getDuelModules, useDuelModules } from "../hooks/useDuelModules";
import { useDuelModel } from "../hooks/useDuelModel";
import { hasEquipment } from "../hooks/useEquipment";
import { useModel } from "../hooks/useModel";
import { useSilhouette } from "../hooks/useSilhouette";
import { useSkin } from "../hooks/useSkin";
import { useSkinAnimation } from "../hooks/useSkinAnimation";
import { useTankTransform } from "../hooks/useTankTransform";
import { Tankopedia } from "../stores/tankopedia";
import { TankopediaDisplay } from "../stores/tankopediaPersistent/constants";

interface TankModelProps {
  // while the lights are down, draws the tank as a flat light shape
  silhouette?: boolean;
}

export function TankModel({ silhouette = false }: TankModelProps) {
  const protagonistState = Tankopedia.use((state) => state.protagonist);
  const protagonist = useDuelModules("protagonist");

  const canvas = useThree((state) => state.gl.domElement);
  const turretContainer = useRef<Group>(null!);
  const gunContainer = useRef<Group>(null!);
  const tankModelDefinition = useDuelModel("protagonist");
  const turretModelDefinition =
    tankModelDefinition.turrets[protagonistState.turret];
  const gunModelDefinition = turretModelDefinition.guns[protagonistState.gun];
  const { gltf } = useModel(protagonistState.tank);
  const nodes = Object.values(gltf.nodes);
  const skinGltf = useSkin(protagonistState.tank);
  const attachmentGltf = useSkin(protagonistState.tank, "attachment");
  const skins = useMemo(
    () => [skinGltf, attachmentGltf].filter((skin) => skin !== undefined),
    [skinGltf, attachmentGltf],
  );

  useTankTransform(
    protagonist.track,
    protagonist.turret,
    turretContainer,
    gunContainer,
  );
  useSkinAnimation(skins);

  const materials = useMemo(() => {
    const collected = new Set<MeshStandardMaterial>();
    const roots = [
      gltf.scene,
      ...skins.flatMap((skin) => [...skin.parts.values()].flat()),
    ];

    for (const root of roots) {
      root.traverse((object) => {
        if (!(object instanceof Mesh)) return;

        for (const material of [object.material].flat()) {
          if (material instanceof MeshStandardMaterial) {
            collected.add(material);
          }
        }
      });
    }

    return [...collected];
  }, [gltf, skins]);

  // also fades emissive parts with the lights
  useSilhouette(silhouette, materials);

  return (
    <>
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
          if (
            isTrack &&
            Tankopedia.state.loaders.display.loaded === TankopediaDisplay.Model
          ) {
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

        return skinTree(node, skins, {
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
          primitive(object, key) {
            return (
              <primitive
                key={key}
                object={object}
                onPointerDown={onPointerDown}
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
            const protagonist = getDuelModules("protagonist").tank;

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

          return skinTree(node, skins, {
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
            primitive(object, key) {
              return (
                <primitive
                  key={key}
                  object={object}
                  onPointerDown={onPointerDown}
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
              const protagonist = getDuelModules("protagonist").tank;

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

            return skinTree(node, skins, {
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
              primitive(object, key) {
                return (
                  <primitive
                    key={key}
                    object={object}
                    onPointerDown={onPointerDown}
                  />
                );
              },
            });
          })}
        </group>
      </group>
    </>
  );
}
