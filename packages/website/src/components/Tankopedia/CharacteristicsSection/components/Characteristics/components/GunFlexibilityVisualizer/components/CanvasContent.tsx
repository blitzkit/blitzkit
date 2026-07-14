import type { QuicklimeEvent } from "quicklime";
import { useEffect, useRef } from "react";
import type { Group } from "three";
import { degToRad } from "three/src/math/MathUtils.js";
import { awaitableModelDefinitions } from "../../../../../../../../core/awaitables/modelDefinitions";
import {
  modelTransformEvent,
  type ModelTransformEventData,
} from "../../../../../../../../core/blitzkit/modelTransform";
import { Duel } from "../../../../../../../../stores/duel";
import { ModelChunk } from "./ModelChunk";

const modelDefinitions = await awaitableModelDefinitions;

export function CanvasContent() {
  const hullWrapper = useRef<Group>(null);
  const gunWrapper = useRef<Group>(null);

  const tank = Duel.use((state) => state.protagonist.tank);
  const turret = Duel.use((state) => state.protagonist.turret);

  const tankModel = modelDefinitions.models[tank.id];
  const turretModel = tankModel.turrets[turret.id];

  // baked-in turret mount tilt (e.g. Minotauro sits pitched 3deg forward);
  // applied as a static base rotation so the live gun pitch composes on top
  // of it, mirroring useTankTransform.ts's turretContainer/gunContainer nesting
  const initialTurretPitch = -degToRad(
    tankModel.initial_turret_rotation?.pitch ?? 0,
  );

  useEffect(() => {
    function handleModelTransformEvent(
      event: QuicklimeEvent<ModelTransformEventData>,
    ) {
      if (!gunWrapper.current || !hullWrapper.current) return;

      gunWrapper.current.rotation.x = event.data.pitch;
      if (event.data.yaw) hullWrapper.current.rotation.y = event.data.yaw;
    }

    modelTransformEvent.on(handleModelTransformEvent);

    return () => {
      modelTransformEvent.off(handleModelTransformEvent);
    };
  }, []);
  return (
    <>
      <group ref={hullWrapper} position={[0, 0, turretModel.gun_origin!.z]}>
        <group position={[0, 0, -turretModel.gun_origin!.z]}>
          <ModelChunk only="body" />
        </group>
      </group>

      <group rotation={[initialTurretPitch, 0, 0]}>
        <ModelChunk only="turret" />

        <group ref={gunWrapper}>
          <ModelChunk only="gun" />
        </group>
      </group>
    </>
  );
}
