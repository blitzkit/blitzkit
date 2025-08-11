import { I_HAT, J_HAT } from '@blitzkit/core';
import { OrbitControls } from '@react-three/drei';
import { invalidate, useFrame, useThree } from '@react-three/fiber';
import { useEffect, useRef } from 'react';
import { PerspectiveCamera, Vector3 } from 'three';
import { OrbitControls as OrbitControlsClass } from 'three-stdlib';
import { awaitableModelDefinitions } from '../../../../../../core/awaitables/modelDefinitions';
import { applyPitchYawLimits } from '../../../../../../core/blitz/applyPitchYawLimits';
import { hasEquipment } from '../../../../../../core/blitzkit/hasEquipment';
import { Pose, poseEvent } from '../../../../../../core/blitzkit/pose';
import { Duel } from '../../../../../../stores/duel';
import { TankopediaEphemeral } from '../../../../../../stores/tankopediaEphemeral';

const poseDistances: Record<Pose, number> = {
  [Pose.HullDown]: 15,
  [Pose.FaceHug]: 5,
  [Pose.Default]: -1,
};

const modelDefinitions = await awaitableModelDefinitions;

interface ControlsProps {
  naked?: boolean;
  autoRotate?: boolean;
  zoomable?: boolean;
  enableRotate?: boolean;
  distanceScale?: number;
}

export function Controls({
  naked,
  autoRotate = true,
  zoomable = true,
  enableRotate = true,
  distanceScale = 1,
}: ControlsProps) {
  const mutateTankopediaEphemeral = TankopediaEphemeral.useMutation();
  const duelStore = Duel.useStore();
  const tankopediaEphemeralStore = TankopediaEphemeral.useStore();
  const camera = useThree((state) => state.camera as PerspectiveCamera);
  const canvas = useThree((state) => state.gl.domElement);
  const orbitControls = useRef<OrbitControlsClass>(null);
  const protagonistTurret = Duel.use((state) => state.protagonist.turret);
  const antagonistTurret = Duel.use((state) => state.antagonist.turret);
  const protagonistTrack = Duel.use((state) => state.protagonist.track);
  const protagonistTank = Duel.use((state) => state.protagonist.tank);
  const antagonistTank = Duel.use((state) => state.antagonist.tank);
  const protagonistGun = Duel.use((state) => state.protagonist.gun);
  const protagonistModelDefinition =
    modelDefinitions.models[protagonistTank.id];
  const protagonistTrackModelDefinition =
    modelDefinitions.models[protagonistTank.id].tracks[protagonistTrack.id];
  const antagonistModelDefinition = modelDefinitions.models[antagonistTank.id];
  const protagonistTurretModelDefinition =
    protagonistModelDefinition.turrets[protagonistTurret.id];
  const antagonistTurretModelDefinition =
    antagonistModelDefinition.turrets[antagonistTurret.id];
  const protagonistGunModelDefinition =
    protagonistTurretModelDefinition.guns[
      protagonistGun.gun_type!.value.base.id
    ];
  const protagonistHullOrigin = new Vector3(
    protagonistTrackModelDefinition.origin.x,
    protagonistTrackModelDefinition.origin.y,
    -protagonistTrackModelDefinition.origin.z,
  );
  const protagonistTurretOrigin = new Vector3(
    protagonistModelDefinition.turret_origin.x,
    protagonistModelDefinition.turret_origin.y,
    -protagonistModelDefinition.turret_origin.z,
  );
  const protagonistGunOrigin = new Vector3(
    protagonistTurretModelDefinition.gun_origin.x,
    protagonistTurretModelDefinition.gun_origin.y,
    -protagonistTurretModelDefinition.gun_origin.z,
  );
  const antagonistGunHeight =
    protagonistTrackModelDefinition.origin.y +
    antagonistModelDefinition.turret_origin.y +
    antagonistTurretModelDefinition.gun_origin.y;
  const disturbed = TankopediaEphemeral.use((state) => state.disturbed);
  const doAutoRotate = autoRotate && !disturbed;
  const gunHeight =
    protagonistHullOrigin.y +
    protagonistTurretOrigin.y +
    protagonistGunOrigin.y;
  const inspectModeInitialPosition = new Vector3(
    -8,
    gunHeight + (naked ? 10 : 2),
    -13,
  ).multiplyScalar(distanceScale);

  const t0 = useRef(Date.now() / 1000);
  useFrame(() => {
    const now = Date.now() / 1000;
    const t = now - t0.current;

    camera.position
      .copy(inspectModeInitialPosition)
      .applyAxisAngle(I_HAT, (Math.PI / 32) * Math.sin(t / 9))
      .applyAxisAngle(J_HAT, (-Math.PI / 16) * Math.sin(t / 7));
  });

  useEffect(() => {
    const unsubscribeTankopediaEphemeral = tankopediaEphemeralStore.subscribe(
      (state) => state.controlsEnabled,
      (enabled) => {
        if (orbitControls.current) orbitControls.current.enabled = enabled;
      },
    );

    async function handlePoseEvent(event: Pose) {
      const duel = duelStore.getState();
      const hasImprovedVerticalStabilizer = await hasEquipment(
        122,
        duel.protagonist.tank.equipment_preset,
        duel.protagonist.equipmentMatrix,
      );
      const hasDownImprovedVerticalStabilizer = await hasEquipment(
        124,
        duel.protagonist.tank.equipment_preset,
        duel.protagonist.equipmentMatrix,
      );

      switch (event) {
        case Pose.HullDown: {
          const [pitch] = applyPitchYawLimits(
            -Infinity,
            0,
            protagonistGunModelDefinition.pitch,
            protagonistTurretModelDefinition.yaw,
            hasImprovedVerticalStabilizer,
            hasDownImprovedVerticalStabilizer,
          );

          camera.position
            .set(0, 0, 0)
            .add(protagonistHullOrigin)
            .add(protagonistTurretOrigin)
            .add(protagonistGunOrigin)
            .add(
              new Vector3(
                0,
                poseDistances[event] * Math.sin(pitch),
                poseDistances[event] * -Math.cos(pitch),
              ),
            );
          camera.lookAt(
            protagonistHullOrigin
              .clone()
              .add(protagonistTurretOrigin)
              .add(protagonistGunOrigin),
          );
          orbitControls.current?.target.set(0, antagonistGunHeight, 0);

          break;
        }

        case Pose.FaceHug: {
          const [pitch] = applyPitchYawLimits(
            0,
            0,
            protagonistGunModelDefinition.pitch,
            protagonistTurretModelDefinition.yaw,
            hasImprovedVerticalStabilizer,
            hasDownImprovedVerticalStabilizer,
          );

          camera.position
            .set(0, 0, 0)
            .add(protagonistHullOrigin)
            .add(protagonistTurretOrigin)
            .add(protagonistGunOrigin)
            .add(
              new Vector3(
                0,
                poseDistances[event] * Math.sin(pitch),
                poseDistances[event] * -Math.cos(pitch),
              ),
            );
          orbitControls.current?.target
            .set(0, 0, 0)
            .add(protagonistHullOrigin)
            .add(protagonistTurretOrigin)
            .add(protagonistGunOrigin)
            .add(
              new Vector3(
                0,
                0.5 * poseDistances[event] * Math.sin(pitch),
                0.5 * poseDistances[event] * -Math.cos(pitch),
              ),
            );

          break;
        }

        case Pose.Default: {
          camera.position.copy(inspectModeInitialPosition);
          orbitControls.current?.target.set(0, 1.25, 0);
          break;
        }
      }

      invalidate();
    }

    poseEvent.on(handlePoseEvent);

    return () => {
      unsubscribeTankopediaEphemeral();
      poseEvent.off(handlePoseEvent);
    };
  }, [camera, protagonistTank.id, antagonistTank.id]);

  useEffect(() => {
    function handleWheel(event: WheelEvent) {
      event.preventDefault();
    }

    function handleScroll(event: Event) {
      event.preventDefault();
    }

    function disturb() {
      mutateTankopediaEphemeral((draft) => {
        draft.disturbed = true;
      });
    }

    poseEvent.on(disturb);
    canvas.addEventListener('pointerdown', disturb);
    canvas.addEventListener('wheel', handleWheel);
    document.body.addEventListener('scroll', handleScroll);

    function updateCamera() {
      if (!orbitControls.current) return;

      orbitControls.current.rotateSpeed = 0.25;

      camera.position.copy(inspectModeInitialPosition);
      orbitControls.current.target.set(0, gunHeight / (naked ? 4 : 2), 0);
      orbitControls.current.enablePan = true;
      orbitControls.current.enableZoom = true;
      camera.fov = naked ? 20 : 25;

      camera.updateProjectionMatrix();
    }

    updateCamera();

    return () => {
      canvas.removeEventListener('pointerdown', disturb);
      poseEvent.off(disturb);
      canvas.removeEventListener('wheel', handleWheel);
      document.body.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <OrbitControls
      enableRotate={enableRotate}
      maxDistance={20}
      minDistance={5}
      enableZoom={zoomable}
      zoomSpeed={zoomable ? undefined : 0}
      ref={orbitControls}
      enabled={tankopediaEphemeralStore.getState().controlsEnabled}
      enableDamping={false}
      autoRotateSpeed={1 / 4}
    />
  );
}
