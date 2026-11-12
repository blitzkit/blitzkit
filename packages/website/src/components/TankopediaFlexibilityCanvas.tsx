import { mauveDark } from "@radix-ui/colors";
import { useFrame } from "@react-three/fiber";
import type { QuicklimeEvent } from "quicklime";
import { Suspense, useEffect, useRef } from "react";
import { LineBasicMaterial, MeshBasicMaterial, type Group } from "three";
import { degToRad } from "three/src/math/MathUtils.js";
import { api } from "../api/dynamic";
import { jsxTree } from "../core/blitzkit/jsxTree";
import {
  modelTransformEvent,
  type ModelTransformEventData,
} from "../core/blitzkit/modelTransform";
import { DuelModule, useDuel } from "../hooks/useDuel";
import { useModel } from "../hooks/useModel";
import { SmartCanvas } from "./SmartCanvas";

const modelDefinitions = await api.models();

const ZOOM = 60;

type Chunk = "gun" | "turret" | "body";

const surfaceMaterial: Record<Chunk, MeshBasicMaterial> = {
  gun: new MeshBasicMaterial({ color: mauveDark.mauve8, toneMapped: false }),
  turret: new MeshBasicMaterial({ color: mauveDark.mauve6, toneMapped: false }),
  body: new MeshBasicMaterial({
    color: mauveDark.mauve6,
    toneMapped: false,
    transparent: true,
    opacity: 0.5,
  }),
};
const outlineMaterial: Record<Chunk, LineBasicMaterial> = {
  gun: new LineBasicMaterial({ color: mauveDark.mauve11, toneMapped: false }),
  turret: new LineBasicMaterial({ color: mauveDark.mauve8, toneMapped: false }),
  body: new LineBasicMaterial({
    color: mauveDark.mauve8,
    toneMapped: false,
    transparent: true,
    opacity: 0.5,
  }),
};

export function TankopediaFlexibilityCanvas() {
  return (
    <SmartCanvas
      orthographic
      camera={{ zoom: ZOOM, rotation: [0, Math.PI / 2, 0] }}
    >
      <Suspense fallback={null}>
        <Content />
      </Suspense>
      <CameraPositioner />
    </SmartCanvas>
  );
}

function CameraPositioner() {
  useFrame(({ camera, gl: { domElement } }) => {
    const { width } = domElement.getBoundingClientRect();
    camera.position.set(10, 0, -width / ZOOM / 6);
  });

  return null;
}

function Content() {
  const hullWrapper = useRef<Group>(null);
  const gunWrapper = useRef<Group>(null);
  const tank = useDuel("protagonist", DuelModule.Tank);
  const turret = useDuel("protagonist", DuelModule.Turret);

  const tankModel = modelDefinitions.models[tank.id];
  const turretModel = tankModel.turrets[turret.id];

  // baked-in turret mount tilt, applied as a static base rotation so the live
  // gun pitch composes on top of it
  const initialTurretPitch = -degToRad(
    tankModel.initial_turret_rotation?.pitch ?? 0,
  );

  useEffect(() => {
    function handle(event: QuicklimeEvent<ModelTransformEventData>) {
      if (!gunWrapper.current || !hullWrapper.current) return;

      gunWrapper.current.rotation.x = event.data.pitch;
      if (event.data.yaw) hullWrapper.current.rotation.y = event.data.yaw;
    }

    modelTransformEvent.on(handle);

    return () => {
      modelTransformEvent.off(handle);
    };
  }, []);

  const origin = turretModel.gun_origin!;

  return (
    <>
      <group ref={hullWrapper} position={[0, 0, -origin.z]}>
        <group position={[0, 0, origin.z]}>
          <ModelChunk only="body" />
        </group>
      </group>

      <group
        position={[0, -origin.y, -origin.z]}
        rotation={[initialTurretPitch, 0, 0]}
      >
        <group position={[0, origin.y, origin.z]}>
          <ModelChunk only="turret" />

          <group ref={gunWrapper}>
            <ModelChunk only="gun" />
          </group>
        </group>
      </group>
    </>
  );
}

function ModelChunk({ only }: { only: Chunk }) {
  const tank = useDuel("protagonist", DuelModule.Tank);
  const turret = useDuel("protagonist", DuelModule.Turret);
  const gun = useDuel("protagonist", DuelModule.Gun);

  const tankModel = modelDefinitions.models[tank.id];
  const turretModel = tankModel.turrets[turret.id];
  const gunModel = turretModel.guns[gun.id];

  const originZ = tankModel.turret_origin!.z + turretModel.gun_origin!.z;
  const originY = tankModel.turret_origin!.y + turretModel.gun_origin!.y;

  const { gltf } = useModel(tank.id);
  const nodes = Object.values(gltf.nodes);

  const gunId = gunModel.model_id.toString().padStart(2, "0");
  const turretId = turretModel.model_id.toString().padStart(2, "0");

  return (
    <group position={[0, -originY, -originZ]}>
      {nodes.map((node) => {
        const isGun =
          node.name === `gun_${gunId}` || node.name === `gun_${gunId}_mask`;
        const isTurret = node.name === `turret_${turretId}`;
        const isBody =
          node.name === "hull" ||
          node.name.startsWith("chassis_wheel_") ||
          node.name.startsWith("chassis_track_");

        if (
          (only === "gun" && !isGun) ||
          (only === "turret" && !isTurret) ||
          (only === "body" && !isBody)
        ) {
          return null;
        }

        return jsxTree(node, {
          mesh(mesh, props, key) {
            return (
              <>
                <mesh key={key} {...props} material={surfaceMaterial[only]} />
                <lineSegments material={outlineMaterial[only]}>
                  <edgesGeometry args={[mesh.geometry, 29]} />
                </lineSegments>
              </>
            );
          },
        });
      })}
    </group>
  );
}
