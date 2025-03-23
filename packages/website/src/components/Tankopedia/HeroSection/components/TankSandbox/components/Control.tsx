import { OrbitControls } from '@react-three/drei';
import { useThree } from '@react-three/fiber';
import { useEffect, useRef, useState } from 'react';
import { PerspectiveCamera } from 'three';
import { OrbitControls as OrbitControlsClass } from 'three-stdlib';
import { degToRad } from 'three/src/math/MathUtils.js';
import { awaitableModelDefinitions } from '../../../../../../core/awaitables/modelDefinitions';
import { Pose } from '../../../../../../core/blitzkit/pose';
import { Duel } from '../../../../../../stores/duel';
import {
  SHOOTING_RANGE_ZOOM_COEFFICIENTS,
  TankopediaEphemeral,
} from '../../../../../../stores/tankopediaEphemeral';
import { TankopediaDisplay } from '../../../../../../stores/tankopediaPersistent/constants';

const poseDistances: Record<Pose, number> = {
  [Pose.HullDown]: 15,
  [Pose.FaceHug]: 5,
  [Pose.Default]: -1,
};

const modelDefinitions = await awaitableModelDefinitions;

const ARCADE_MODE_DISTANCE = 19;
// const ARCADE_MODE_ANGLE = Math.PI / 8;
const ARCADE_MODE_ANGLE = degToRad(10);
const ARCADE_MODE_FOV = 54;

interface ControlsProps {
  naked?: boolean;
}

export function Controls({ naked }: ControlsProps) {
  const mutateTankopediaEphemeral = TankopediaEphemeral.useMutation();
  const display = TankopediaEphemeral.use((state) => state.display);
  const duelStore = Duel.useStore();
  const tankopediaEphemeralStore = TankopediaEphemeral.useStore();
  const camera = useThree((state) => state.camera as PerspectiveCamera);
  const canvas = useThree((state) => state.gl.domElement);
  const orbitControls = useRef<OrbitControlsClass>(null);
  // const protagonistTurret = Duel.use((state) => state.protagonist.turret);
  // const antagonistTurret = Duel.use((state) => state.antagonist.turret);
  // const protagonistTrack = Duel.use((state) => state.protagonist.track);
  const protagonistTank = Duel.use((state) => state.protagonist.tank);
  // const antagonistTank = Duel.use((state) => state.antagonist.tank);
  // const protagonistGun = Duel.use((state) => state.protagonist.gun);
  // const protagonistModelDefinition =
  //   modelDefinitions.models[protagonistTank.id];
  // const protagonistTrackModelDefinition =
  //   modelDefinitions.models[protagonistTank.id].tracks[protagonistTrack.id];
  // const antagonistModelDefinition = modelDefinitions.models[antagonistTank.id];
  // const protagonistTurretModelDefinition =
  //   protagonistModelDefinition.turrets[protagonistTurret.id];
  // const antagonistTurretModelDefinition =
  //   antagonistModelDefinition.turrets[antagonistTurret.id];
  // const protagonistGunModelDefinition =
  //   protagonistTurretModelDefinition.guns[
  //     protagonistGun.gun_type!.value.base.id
  //   ];
  // const protagonistHullOrigin = new Vector3(
  //   protagonistTrackModelDefinition.origin.x,
  //   protagonistTrackModelDefinition.origin.y,
  //   -protagonistTrackModelDefinition.origin.z,
  // );
  // const protagonistTurretOrigin = new Vector3(
  //   protagonistModelDefinition.turret_origin.x,
  //   protagonistModelDefinition.turret_origin.y,
  //   -protagonistModelDefinition.turret_origin.z,
  // );
  // const protagonistGunOrigin = new Vector3(
  //   protagonistTurretModelDefinition.gun_origin.x,
  //   protagonistTurretModelDefinition.gun_origin.y,
  //   -protagonistTurretModelDefinition.gun_origin.z,
  // );
  // const antagonistGunHeight =
  //   protagonistTrackModelDefinition.origin.y +
  //   antagonistModelDefinition.turret_origin.y +
  //   antagonistTurretModelDefinition.gun_origin.y;
  const [autoRotate, setAutoRotate] = useState(
    display !== TankopediaDisplay.ShootingRange && !naked,
  );
  // const gunHeight =
  //   protagonistHullOrigin.y +
  //   protagonistTurretOrigin.y +
  //   protagonistGunOrigin.y;
  const gunHeight = 2;
  const inspectModeInitialPosition = [
    13,
    gunHeight + (naked ? 10 : 4),
    -8,
  ] as const;
  // const protagonistGunOriginOnlyY = new Vector3(
  //   0,
  //   protagonistTurretModelDefinition.gun_origin.y,
  //   0,
  // );
  // const shellOrigin = protagonistHullOrigin
  //   .clone()
  //   .add(protagonistTurretOrigin)
  //   .add(protagonistGunOriginOnlyY);

  useEffect(() => {
    const unsubscribeTankopediaEphemeral = tankopediaEphemeralStore.subscribe(
      (state) => state.controlsEnabled,
      (enabled) => {
        if (orbitControls.current) orbitControls.current.enabled = enabled;
      },
    );

    // async function handlePoseEvent(event: Pose) {
    //   const duel = duelStore.getState();
    //   const hasImprovedVerticalStabilizer = await hasEquipment(
    //     122,
    //     duel.protagonist.tank.equipment_preset,
    //     duel.protagonist.equipmentMatrix,
    //   );
    //   const hasDownImprovedVerticalStabilizer = await hasEquipment(
    //     124,
    //     duel.protagonist.tank.equipment_preset,
    //     duel.protagonist.equipmentMatrix,
    //   );

    //   switch (event) {
    //     case Pose.HullDown: {
    //       const [pitch] = applyPitchYawLimits(
    //         -Infinity,
    //         0,
    //         protagonistGunModelDefinition.pitch,
    //         protagonistTurretModelDefinition.yaw,
    //         hasImprovedVerticalStabilizer,
    //         hasDownImprovedVerticalStabilizer,
    //       );

    //       camera.position
    //         .set(0, 0, 0)
    //         .add(protagonistHullOrigin)
    //         .add(protagonistTurretOrigin)
    //         .add(protagonistGunOrigin)
    //         .add(
    //           new Vector3(
    //             0,
    //             poseDistances[event] * Math.sin(pitch),
    //             poseDistances[event] * -Math.cos(pitch),
    //           ),
    //         );
    //       camera.lookAt(
    //         protagonistHullOrigin
    //           .clone()
    //           .add(protagonistTurretOrigin)
    //           .add(protagonistGunOrigin),
    //       );
    //       orbitControls.current?.target.set(0, antagonistGunHeight, 0);

    //       break;
    //     }

    //     case Pose.FaceHug: {
    //       const [pitch] = applyPitchYawLimits(
    //         0,
    //         0,
    //         protagonistGunModelDefinition.pitch,
    //         protagonistTurretModelDefinition.yaw,
    //         hasImprovedVerticalStabilizer,
    //         hasDownImprovedVerticalStabilizer,
    //       );

    //       camera.position
    //         .set(0, 0, 0)
    //         .add(protagonistHullOrigin)
    //         .add(protagonistTurretOrigin)
    //         .add(protagonistGunOrigin)
    //         .add(
    //           new Vector3(
    //             0,
    //             poseDistances[event] * Math.sin(pitch),
    //             poseDistances[event] * -Math.cos(pitch),
    //           ),
    //         );
    //       orbitControls.current?.target
    //         .set(0, 0, 0)
    //         .add(protagonistHullOrigin)
    //         .add(protagonistTurretOrigin)
    //         .add(protagonistGunOrigin)
    //         .add(
    //           new Vector3(
    //             0,
    //             0.5 * poseDistances[event] * Math.sin(pitch),
    //             0.5 * poseDistances[event] * -Math.cos(pitch),
    //           ),
    //         );

    //       break;
    //     }

    //     case Pose.Default: {
    //       camera.position.set(...inspectModeInitialPosition);
    //       orbitControls.current?.target.set(0, 1.25, 0);
    //       break;
    //     }
    //   }

    //   invalidate();
    // }

    // poseEvent.on(handlePoseEvent);

    return () => {
      unsubscribeTankopediaEphemeral();
      // poseEvent.off(handlePoseEvent);
    };
  }, [
    camera,
    // protagonistTank.id,
    // antagonistTank.id
  ]);

  useEffect(() => {
    let isInitialIteration = true;

    function handleDisturbance() {
      setAutoRotate(false);
    }

    // function handleKeyDown(event: KeyboardEvent) {
    //   if (display !== TankopediaDisplay.ShootingRange || event.repeat) return;

    //   if (event.key === 'Shift') {
    //     mutateTankopediaEphemeral((draft) => {
    //       draft.shootingRangeZoom =
    //         draft.shootingRangeZoom === ShootingRangeZoom.Arcade
    //           ? ShootingRangeZoom.Zoom0
    //           : ShootingRangeZoom.Arcade;
    //     });
    //   }
    // }

    // function handleWheel(event: WheelEvent) {
    //   if (display !== TankopediaDisplay.ShootingRange) return;

    //   event.preventDefault();

    //   mutateTankopediaEphemeral((draft) => {
    //     draft.shootingRangeZoom = clamp(
    //       draft.shootingRangeZoom - Math.sign(event.deltaY),
    //       ShootingRangeZoom.Arcade,
    //       ShootingRangeZoom.Zoom2,
    //     );
    //   });
    // }

    // function handleScroll(event: Event) {
    //   if (display !== TankopediaDisplay.ShootingRange) return;

    //   event.preventDefault();
    // }

    // poseEvent.on(handleDisturbance);
    canvas.addEventListener('pointerdown', handleDisturbance);
    // window.addEventListener('keydown', handleKeyDown);
    // canvas.addEventListener('wheel', handleWheel);
    // document.body.addEventListener('scroll', handleScroll);

    function updateCamera() {
      if (!orbitControls.current) return;

      orbitControls.current.rotateSpeed = 0.25;

      if (display === TankopediaDisplay.ShootingRange) {
        const { shootingRangeZoom } = tankopediaEphemeralStore.getState();

        orbitControls.current.enablePan = false;
        orbitControls.current.enableZoom = false;
        orbitControls.current.rotateSpeed *=
          SHOOTING_RANGE_ZOOM_COEFFICIENTS[shootingRangeZoom];
        camera.fov =
          ARCADE_MODE_FOV * SHOOTING_RANGE_ZOOM_COEFFICIENTS[shootingRangeZoom];

        // if (shootingRangeZoom === ShootingRangeZoom.Arcade) {
        //   orbitControls.current.target.set(0, gunHeight + 3, 0);

        //   if (isInitialIteration) {
        //     isInitialIteration = false;
        //     camera.position.set(
        //       0,
        //       gunHeight + ARCADE_MODE_DISTANCE * Math.sin(ARCADE_MODE_ANGLE),
        //       ARCADE_MODE_DISTANCE * Math.cos(ARCADE_MODE_ANGLE),
        //     );
        //   } else {
        //     camera.position
        //       .copy(aimTarget)
        //       .sub(orbitControls.current.target)
        //       .normalize()
        //       .multiplyScalar(-ARCADE_MODE_DISTANCE)
        //       .add(orbitControls.current.target);
        //   }
        // } else {
        //   orbitControls.current.target.copy(shellOrigin);

        //   camera.position
        //     .copy(aimTarget)
        //     .sub(shellOrigin)
        //     .normalize()
        //     .multiplyScalar(-Number.EPSILON)
        //     .add(shellOrigin);
        // }
      } else {
        camera.position.set(...inspectModeInitialPosition);
        orbitControls.current.target.set(0, gunHeight / (naked ? 4 : 2), 0);
        orbitControls.current.enablePan = true;
        orbitControls.current.enableZoom = true;
        camera.fov = naked ? 20 : 25;
      }

      camera.updateProjectionMatrix();
    }

    updateCamera();

    const unsubscribeDisplay = tankopediaEphemeralStore.subscribe(
      (state) => state.display,
      () => {
        handleDisturbance();
        updateCamera();
      },
    );

    const unsubscribeShootingRangeZoom = tankopediaEphemeralStore.subscribe(
      (state) => state.shootingRangeZoom,
      updateCamera,
    );

    return () => {
      canvas.removeEventListener('pointerdown', handleDisturbance);
      // poseEvent.off(handleDisturbance);
      unsubscribeDisplay();
      unsubscribeShootingRangeZoom();
      // window.removeEventListener('keydown', handleKeyDown);
      // canvas.removeEventListener('wheel', handleWheel);
      // document.body.removeEventListener('scroll', handleScroll);
    };
  }, [display === TankopediaDisplay.ShootingRange]);

  return (
    <OrbitControls
      maxDistance={20}
      minDistance={5}
      ref={orbitControls}
      enabled={tankopediaEphemeralStore.getState().controlsEnabled}
      enableDamping={false}
      autoRotate={autoRotate}
      autoRotateSpeed={1 / 4}
    />
  );
}
