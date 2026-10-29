import { I_HAT, J_HAT } from "@blitzkit/core";
import { OrbitControls } from "@react-three/drei";
import { invalidate, useFrame, useThree } from "@react-three/fiber";
import type { QuicklimeEvent } from "quicklime";
import { useEffect, useRef } from "react";
import { PerspectiveCamera, Vector3 } from "three";
import { OrbitControls as OrbitControlsClass } from "three-stdlib";
import { api } from "../api/dynamic";
import { applyPitchYawLimits } from "../core/blitz/applyPitchYawLimits";
import { Pose, poseEvent } from "../core/blitzkit/pose";
import { controlsEnabledEvent } from "../core/controlsEnabled";
import { DuelModule, getDuel, useDuel } from "../hooks/useDuel";
import { hasEquipment } from "../hooks/useEquipment";
import { Tankopedia } from "../stores/tankopedia";

const poseDistances: Record<Pose, number> = {
  [Pose.HullDown]: 15,
  [Pose.FaceHug]: 5,
  [Pose.Default]: -1,
};

const inspectModeInitialPosition = new Vector3(-8, 2, -13);

const modelDefinitions = await api.models();

interface ControlsProps {
  autoRotate?: boolean;
  zoomable?: boolean;
  enableRotate?: boolean;
}

export function CanvasControl({
  autoRotate = true,
  zoomable = true,
  enableRotate = true,
}: ControlsProps) {
  const camera = useThree((state) => state.camera as PerspectiveCamera);
  const canvas = useThree((state) => state.gl.domElement);
  const orbitControls = useRef<OrbitControlsClass>(null);
  const protagonistTurret = useDuel("protagonist", DuelModule.Turret);
  const antagonistTurret = useDuel("antagonist", DuelModule.Turret);
  const protagonistTrack = useDuel("protagonist", DuelModule.Track);
  const protagonistTank = useDuel("protagonist", DuelModule.Tank);
  const antagonistTank = useDuel("antagonist", DuelModule.Tank);
  const protagonistGun = useDuel("protagonist", DuelModule.Gun);
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
    protagonistTurretModelDefinition.guns[protagonistGun.id];
  const protagonistHullOrigin = new Vector3(
    protagonistTrackModelDefinition.origin!.x,
    protagonistTrackModelDefinition.origin!.y,
    -protagonistTrackModelDefinition.origin!.z,
  );
  const protagonistTurretOrigin = new Vector3(
    protagonistModelDefinition.turret_origin!.x,
    protagonistModelDefinition.turret_origin!.y,
    -protagonistModelDefinition.turret_origin!.z,
  );
  const protagonistGunOrigin = new Vector3(
    protagonistTurretModelDefinition.gun_origin!.x,
    protagonistTurretModelDefinition.gun_origin!.y,
    -protagonistTurretModelDefinition.gun_origin!.z,
  );
  const antagonistGunHeight =
    protagonistTrackModelDefinition.origin!.y +
    antagonistModelDefinition.turret_origin!.y +
    antagonistTurretModelDefinition.gun_origin!.y;
  const disturbed = Tankopedia.use((state) => state.disturbed);
  const doAutoRotate = autoRotate && !disturbed;
  const gunHeight =
    protagonistHullOrigin.y +
    protagonistTurretOrigin.y +
    protagonistGunOrigin.y;

  useEffect(() => {
    function handleControlsEnabled(event: QuicklimeEvent<boolean>) {
      if (!orbitControls.current) return;
      orbitControls.current.enabled = event.data;
    }

    controlsEnabledEvent.on(handleControlsEnabled);

    function handlePoseEvent(event: Pose) {
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

      switch (event) {
        case Pose.HullDown: {
          const [pitch] = applyPitchYawLimits(
            -Infinity,
            0,
            protagonistGunModelDefinition.pitch!,
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
            protagonistGunModelDefinition.pitch!,
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
      controlsEnabledEvent.off(handleControlsEnabled);
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
      Tankopedia.mutate((draft) => {
        draft.disturbed = true;
      });
    }

    poseEvent.on(disturb);
    canvas.addEventListener("pointerdown", disturb);
    canvas.addEventListener("wheel", handleWheel);
    document.body.addEventListener("scroll", handleScroll);

    function updateCamera() {
      if (!orbitControls.current) return;

      orbitControls.current.rotateSpeed = 0.25;

      camera.position.copy(inspectModeInitialPosition);
      orbitControls.current.target.set(0, gunHeight * 0.6, 0);
      orbitControls.current.enablePan = true;
      orbitControls.current.enableZoom = true;
      camera.fov = 25;

      camera.updateProjectionMatrix();
    }

    updateCamera();

    return () => {
      canvas.removeEventListener("pointerdown", disturb);
      poseEvent.off(disturb);
      canvas.removeEventListener("wheel", handleWheel);
      document.body.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <>
      {doAutoRotate && <Animator />}

      <OrbitControls
        enableRotate={enableRotate}
        maxDistance={40}
        minDistance={5}
        enableZoom={zoomable}
        zoomSpeed={zoomable ? undefined : 0}
        ref={orbitControls}
        enabled={controlsEnabledEvent.last!}
        enableDamping={false}
      />
    </>
  );
}

function Animator() {
  const clock = useThree((state) => state.clock);
  const t0 = useRef(clock.elapsedTime);

  useFrame(({ camera }) => {
    const t = clock.elapsedTime - t0.current;

    camera.position
      .copy(inspectModeInitialPosition)
      .applyAxisAngle(I_HAT, (Math.PI / 32) * Math.sin(t / 9))
      .applyAxisAngle(J_HAT, (-Math.PI / 16) * Math.sin(t / 7));

    invalidate();
  });

  return null;
}
