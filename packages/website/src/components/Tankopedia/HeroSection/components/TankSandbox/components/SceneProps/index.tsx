import { J_HAT } from '@blitzkit/core';
import { useLoader } from '@react-three/fiber';
import { useCallback, useEffect, useRef } from 'react';
import { Group, Plane, TextureLoader, Vector2 } from 'three';
import { clamp } from 'three/src/math/MathUtils.js';
import {
  dissectEvent,
  lastDissection,
  type DissectEventData,
} from '../../../../../../../core/blitzkit/dissect';
import { TankopediaEphemeral } from '../../../../../../../stores/tankopediaEphemeral';
import { TankopediaDisplay } from '../../../../../../../stores/tankopediaPersistent/constants';

// const [modelDefinitions, equipmentDefinitions, provisionDefinitions] =
//   await Promise.all([
//     awaitableModelDefinitions,
//     awaitableEquipmentDefinitions,
//     awaitableProvisionDefinitions,
//   ]);

// const emptyVector = new Vector2();

const GRID_SIZE = 10;

export function SceneProps() {
  const mutateTankopediaEphemeral = TankopediaEphemeral.useMutation();
  // const targetCircleWrapper = useRef<Group>(null);
  // const clientTargetCircle = useRef<HTMLDivElement>(null);
  // const serverTargetCircle = useRef<HTMLDivElement>(null);
  // const playground = useRef<Group>(null);

  // let lastPitch = Duel.use((state) => state.protagonist.pitch);
  // let lastYaw = Duel.use((state) => state.protagonist.yaw);
  const display = TankopediaEphemeral.use((state) => state.display);
  // const turret = Duel.use((state) => state.protagonist.turret);
  // const track = Duel.use((state) => state.protagonist.track);
  // const tank = Duel.use((state) => state.protagonist.tank);
  // const gun = Duel.use((state) => state.protagonist.gun);
  // const shell = Duel.use((state) => state.protagonist.shell);
  // const engine = Duel.use((state) => state.protagonist.engine);
  // const tankModelDefinition = modelDefinitions.models[tank.id];
  // const trackModelDefinition =
  //   modelDefinitions.models[tank.id].tracks[track.id];
  // const gunModelDefinition =
  //   tankModelDefinition.turrets[turret.id].guns[gun.gun_type!.value.base.id];
  // const turretModelDefinition = tankModelDefinition.turrets[turret.id];
  // const hullOrigin = new Vector3(
  //   trackModelDefinition.origin.x,
  //   trackModelDefinition.origin.y,
  //   -trackModelDefinition.origin.z,
  // );
  // const turretOrigin = new Vector3(
  //   tankModelDefinition.turret_origin.x,
  //   tankModelDefinition.turret_origin.y,
  //   -tankModelDefinition.turret_origin.z,
  // );
  // const gunOriginOnlyY = new Vector3(0, turretModelDefinition.gun_origin.y, 0);
  // const shellOrigin = hullOrigin.clone().add(turretOrigin).add(gunOriginOnlyY);
  // const camouflage = Duel.use((state) => state.protagonist.camouflage);
  // const crewSkills = TankopediaEphemeral.use((state) => state.skills);
  // const consumables = Duel.use((state) => state.protagonist.consumables);
  // const provisions = Duel.use((state) => state.protagonist.provisions);
  // const equipmentMatrix = Duel.use(
  //   (state) => state.protagonist.equipmentMatrix,
  // );
  // const characteristics = tankCharacteristics(
  //   {
  //     tank,
  //     turret,
  //     gun,
  //     shell,
  //     consumables,
  //     applyDynamicArmor: false,
  //     applyReactiveArmor: false,
  //     applySpallLiner: false,
  //     camouflage,
  //     crewSkills,
  //     engine,
  //     equipmentMatrix,
  //     provisions,
  //     stockEngine: tank.engines[0],
  //     stockGun: tank.turrets[0].guns[0],
  //     stockTurret: tank.turrets[0],
  //     stockTrack: tank.tracks[0],
  //     track,
  //   },
  //   { equipmentDefinitions, provisionDefinitions, tankModelDefinition },
  // );
  // let { dispersion } = characteristics;
  // const gunRotationSpeed = degToRad(characteristics.gunTraverseSpeed);
  // const mockTank = useLoader(GLTFLoader, asset(`3d/tanks/models/6929.glb`));
  const gridTexture = useLoader(TextureLoader, '/assets/images/3d/grid.png');
  const dragTexture = useLoader(
    TextureLoader,
    '/assets/images/3d/drag-slicer.png',
  );
  gridTexture.anisotropy = 2;
  // const path = new Vector3();
  // const direction = new Vector3();

  // let lastTime = 0;
  // let DEBUG_disable = false;

  // useFrame(({ raycaster, camera, clock, gl }) => {
  //   if (
  //     display !== TankopediaDisplay.ShootingRange ||
  //     !playground.current ||
  //     !targetCircleWrapper.current ||
  //     DEBUG_disable ||
  //     !clientTargetCircle.current ||
  //     !serverTargetCircle.current
  //   ) {
  //     return;
  //   }

  //   raycaster.setFromCamera(emptyVector, camera);

  //   const cameraIntersections = raycaster.intersectObjects(
  //     playground.current.children,
  //     true,
  //   );

  //   let length: number;

  //   if (cameraIntersections.length === 0) {
  //     length = characteristics.shellRange;
  //     direction.set(0, 0, -1).applyQuaternion(camera.quaternion);
  //     aimTarget.copy(shellOrigin).addScaledVector(direction, length);
  //   } else {
  //     aimTarget.copy(cameraIntersections[0].point);
  //     path.copy(aimTarget).sub(shellOrigin);
  //     length = path.length();
  //     direction.copy(path).normalize();
  //   }

  //   const deltaT = clock.elapsedTime - lastTime;
  //   lastTime = clock.elapsedTime;

  //   const desiredPitch = Math.asin(direction.y);
  //   const desiredYaw = Math.atan2(-direction.x, -direction.z);
  //   const deltaPitch = desiredPitch - lastPitch;
  //   const deltaYaw = desiredYaw - lastYaw;
  //   const deltaAngle = Math.sqrt(deltaPitch ** 2 + deltaYaw ** 2);
  //   const maxPossibleRotationInTime = gunRotationSpeed * deltaT;
  //   const clampedDeltaAngle = Math.min(maxPossibleRotationInTime, deltaAngle);
  //   const clampedDeltaPitch =
  //     deltaAngle === 0 ? 0 : deltaPitch * (clampedDeltaAngle / deltaAngle);
  //   const clampedDeltaYaw =
  //     deltaAngle === 0 ? 0 : deltaYaw * (clampedDeltaAngle / deltaAngle);

  //   const [pitch, yaw] = applyPitchYawLimits(
  //     lastPitch + clampedDeltaPitch,
  //     lastYaw + clampedDeltaYaw,
  //     gunModelDefinition.pitch,
  //     turretModelDefinition.yaw,
  //   );

  //   const actualDeltaPitch = pitch - lastPitch;
  //   const actualDeltaYaw = yaw - lastYaw;
  //   const deltaRotation = Math.abs(actualDeltaPitch) + Math.abs(actualDeltaYaw);
  //   const rotationSpeed = deltaRotation / deltaT;
  //   const turretTraversePenalty =
  //     characteristics.dispersionTurretTraversing * radToDeg(rotationSpeed);

  //   const penalty = Math.sqrt(1 + turretTraversePenalty ** 2);

  //   if (penalty === 1) {
  //     const dispersionMod = dispersion - characteristics.dispersion;
  //     const dispersionModDischarged =
  //       dispersionMod * Math.exp(-deltaT / characteristics.aimTime) -
  //       dispersionMod;

  //     dispersion += dispersionModDischarged;
  //   } else {
  //     dispersion = Math.max(characteristics.dispersion * penalty, dispersion);
  //   }

  //   modelTransformEvent.emit({ pitch, yaw });
  //   lastPitch = pitch;
  //   lastYaw = yaw;

  //   const gunDirection = new Vector3(0, 0, -1)
  //     .applyAxisAngle(I_HAT, pitch)
  //     .applyAxisAngle(J_HAT, yaw);

  //   raycaster.set(shellOrigin, gunDirection);

  //   const gunIntersections = raycaster.intersectObjects(
  //     playground.current.children,
  //     true,
  //   );

  //   let gunTarget: Vector3;

  //   if (gunIntersections.length === 0) {
  //     gunTarget = shellOrigin
  //       .clone()
  //       .add(gunDirection.multiplyScalar(characteristics.shellRange));
  //   } else {
  //     gunTarget = gunIntersections[0].point;
  //   }

  //   targetCircleWrapper.current.position.copy(gunTarget);

  //   const distanceToTarget = gunTarget.distanceTo(shellOrigin);
  //   const dispersionRadius = dispersion * (distanceToTarget / 100);
  //   const dispersionSize = 2 * dispersionRadius;
  //   const targetDistanceFromCamera = gunTarget.distanceTo(camera.position);
  //   const angularSize =
  //     2 * Math.atan(dispersionSize / (2 * targetDistanceFromCamera));
  //   const verticalScreenSize =
  //     2 * Math.tan(degToRad((camera as PerspectiveCamera).fov) / 2);
  //   const screenSpaceSize =
  //     gl.domElement.clientHeight * (angularSize / verticalScreenSize);
  //   const targetCircleDotsSize = `${screenSpaceSize}px`;

  //   clientTargetCircle.current.style.width = targetCircleDotsSize;
  //   clientTargetCircle.current.style.height = targetCircleDotsSize;
  //   serverTargetCircle.current.style.width = targetCircleDotsSize;
  //   serverTargetCircle.current.style.height = targetCircleDotsSize;
  // });

  const dissector = useRef<Group>(null);
  const position = useRef(new Vector2());
  const delta = useRef(new Vector2());
  const clippingPlane = useRef(new Plane());
  const handlePointerMove = useCallback((event: PointerEvent) => {
    delta.current.set(event.clientX, event.clientY).sub(position.current);
    position.current.set(event.clientX, event.clientY);

    dissectEvent.emit({
      rotation:
        lastDissection.rotation +
        2 * Math.PI * (delta.current.x / window.innerWidth),
      offset: clamp(
        lastDissection.offset +
          GRID_SIZE * (delta.current.y / window.innerHeight),
        -5,
        5,
      ),
    });
  }, []);
  const handlePointerUp = useCallback(() => {
    mutateTankopediaEphemeral((draft) => {
      draft.controlsEnabled = true;
    });

    window.removeEventListener('pointermove', handlePointerMove);
    window.removeEventListener('pointerup', handlePointerUp);
  }, []);

  useEffect(() => {
    function handleDissectEvent(event: DissectEventData) {
      clippingPlane.current.normal
        .set(0, 0, 1)
        .applyAxisAngle(J_HAT, event.rotation - Math.PI / 2);
      clippingPlane.current.constant = event.offset;

      if (!dissector.current) return;

      dissector.current.rotation.set(0, event.rotation, 0);
      dissector.current.position
        .set(event.offset, 0, 0)
        .applyAxisAngle(J_HAT, event.rotation);
    }

    dissectEvent.on(handleDissectEvent);
    handleDissectEvent(lastDissection);

    return () => {
      dissectEvent.off(handleDissectEvent);
    };
  }, [display]);

  return (
    <>
      {display !== TankopediaDisplay.ShootingRange && (
        <>
          <mesh rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[GRID_SIZE, GRID_SIZE]} />
            <meshStandardMaterial
              clippingPlanes={
                display === TankopediaDisplay.Dissector
                  ? [clippingPlane.current]
                  : []
              }
              map={gridTexture}
              transparent
            />
          </mesh>

          {display === TankopediaDisplay.Dissector && (
            <group ref={dissector}>
              <mesh
                position={[GRID_SIZE / 8, 0, 0]}
                rotation={[-Math.PI / 2, 0, Math.PI / 2]}
                onPointerDown={(event) => {
                  if (
                    display !== TankopediaDisplay.Dissector ||
                    !dissector.current ||
                    event.point.distanceTo(dissector.current.position) > 1.5
                  )
                    return;

                  event.stopPropagation();

                  position.current.set(
                    event.nativeEvent.clientX,
                    event.nativeEvent.clientY,
                  );
                  mutateTankopediaEphemeral((draft) => {
                    draft.controlsEnabled = false;
                  });

                  window.addEventListener('pointermove', handlePointerMove);
                  window.addEventListener('pointerup', handlePointerUp);
                }}
              >
                <planeGeometry args={[GRID_SIZE / 2, GRID_SIZE / 4]} />
                <meshStandardMaterial map={dragTexture} transparent />
              </mesh>
            </group>
          )}
        </>
      )}

      {/* {display === TankopediaDisplay.ShootingRange && (
        <>
          <group ref={targetCircleWrapper}>
            <Html center occlude={false} zIndexRange={[0, 0]}>
              <TargetCircle variant="client" ref={clientTargetCircle} />
              <TargetCircle variant="server" ref={serverTargetCircle} />
            </Html>
          </group>

          <group ref={playground}>
            <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
              <planeGeometry args={[100, 100]} />
              <meshStandardMaterial color={0x404040} />
            </mesh>

            <mesh
              receiveShadow
              castShadow
              position={[10, 1.5, -10]}
              rotation={[0, Math.PI / 4, 0]}
            >
              <boxGeometry args={[1, 3, 1]} />
              <meshStandardMaterial color={0xff8040} />
            </mesh>

            <group position={[0, 0, -25]} rotation={[-Math.PI / 2, 0, Math.PI]}>
              <primitive object={mockTank.scene} />
            </group>
          </group>
        </>
      )} */}
    </>
  );
}
