import { useThree, type ThreeEvent } from "@react-three/fiber";
import type { QuicklimeEvent } from "quicklime";
import { useCallback, useEffect, useRef } from "react";
import { Group, Vector2 } from "three";
import { awaitableModelDefinitions } from "../../../core/awaitables/modelDefinitions";
import { jsxTree } from "../../../core/blitzkit/jsxTree";
import {
  modelTransformEvent,
  type ModelTransformEventData,
} from "../../../core/blitzkit/modelTransform";
import { controlsEnabledEvent } from "../../../core/controlsEnabled";
import { useModel } from "../../../hooks/useModel";
import { Mixer } from "../../../stores/mixer";

const modelDefinitions = await awaitableModelDefinitions;

export function Model() {
  const canvas = useThree((state) => state.gl.domElement);

  const turretGroup = useRef<Group>(null!);
  const gunGroup = useRef<Group>(null!);

  const hull = Mixer.use((state) => state.hull);
  const turret = Mixer.use((state) => state.turret);
  const gun = Mixer.use((state) => state.gun);

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

  const pointer = useRef(new Vector2());
  const delta = useRef(new Vector2());

  const handlePointerDown = useCallback((event: ThreeEvent<PointerEvent>) => {
    event.stopPropagation();

    controlsEnabledEvent.dispatch(false);
    pointer.current.set(event.clientX, event.clientY);

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);
  }, []);
  const handlePointerMove = useCallback((event: PointerEvent) => {
    const bounds = canvas.getBoundingClientRect();

    delta.current.set(event.clientX, event.clientY).sub(pointer.current);
    pointer.current.set(event.clientX, event.clientY);

    modelTransformEvent.dispatch({
      pitch:
        modelTransformEvent.last!.pitch +
        delta.current.y * (Math.PI / bounds.height),
      yaw:
        modelTransformEvent.last!.yaw +
        delta.current.x * (Math.PI / bounds.width),
    });
  }, []);
  const handlePointerUp = useCallback(() => {
    controlsEnabledEvent.dispatch(true);

    window.removeEventListener("pointermove", handlePointerMove);
    window.removeEventListener("pointerup", handlePointerUp);
  }, []);

  useEffect(() => {
    function handleModelTransform(
      event: QuicklimeEvent<ModelTransformEventData>
    ) {
      turretGroup.current.rotation.z = event.data.yaw;
    }

    modelTransformEvent.on(handleModelTransform);

    return () => {
      modelTransformEvent.off(handleModelTransform);
    };
  }, []);

  return (
    <group rotation={[-Math.PI / 2, 0, 0]}>
      {hullNodes.map((node) => {
        const isHull = node.name === "hull";
        const isWheel = node.name.startsWith("chassis_wheel_");
        const isTrack = node.name.startsWith("chassis_track_");
        const isVisible = isHull || isWheel || isTrack;

        if (!isVisible) return null;

        return jsxTree(node, {
          mesh(_, props, key) {
            return <mesh {...props} key={key} castShadow receiveShadow />;
          },
        });
      })}

      <mesh>
        <icosahedronGeometry args={[0.1]} />
        <meshNormalMaterial depthTest={false} depthWrite={false} />
      </mesh>

      <group
        position={[
          tankModel.turret_origin.x + trackModel.origin.x,
          tankModel.turret_origin.z + trackModel.origin.z,
          tankModel.turret_origin.y + trackModel.origin.y,
        ]}
        ref={turretGroup}
        rotation={[0, 0, modelTransformEvent.last!.yaw]}
      >
        <group
          position={[
            -turretTankModel.turret_origin.x - turretTrackModel.origin.x,
            -turretTankModel.turret_origin.z - turretTrackModel.origin.z,
            -turretTankModel.turret_origin.y - turretTrackModel.origin.y,
          ]}
        >
          {turretNodes.map((node) => {
            const isCurrentTurret =
              node.name ===
              `turret_${turretModel.model_id.toString().padStart(2, "0")}`;
            const isVisible = isCurrentTurret;

            if (!isVisible) return null;

            return jsxTree(node, {
              mesh(_, props, key) {
                return (
                  <mesh
                    {...props}
                    key={key}
                    castShadow
                    receiveShadow
                    onPointerDown={handlePointerDown}
                  />
                );
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
                `gun_${gunModel.model_id.toString().padStart(2, "0")}_mask`;
              const isCurrentGun =
                node.name ===
                `gun_${gunModel.model_id.toString().padStart(2, "0")}`;
              const isVisible = isCurrentGun || isCurrentMantlet;

              if (!isVisible) return null;

              return jsxTree(node, {
                mesh(_, props, key) {
                  return <mesh {...props} key={key} castShadow receiveShadow />;
                },
              });
            })}
          </group>
        </group>
      </group>
    </group>
  );
}
