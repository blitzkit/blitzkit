import {
  forwardRef,
  Suspense,
  useEffect,
  useImperativeHandle,
  useRef,
} from "react";
import { applyPitchYawLimits } from "../../core/blitz/applyPitchYawLimits";
import { modelTransformEvent } from "../../core/blitzkit/modelTransform";
import { Pose, poseEvent } from "../../core/blitzkit/pose";
import { useEquipment } from "../../hooks/useEquipment";
import { useModel } from "../../hooks/useModel";
import { useProtagonistGun } from "../../hooks/useProtagonistGun";
import { useProtagonistTank } from "../../hooks/useProtagonistTank";
import { useProtagonistTurret } from "../../hooks/useProtagonistTurret";
import { Tankopedia } from "../../stores/tankopedia";
import { TankopediaPersistent } from "../../stores/tankopediaPersistent";
import { TankopediaDisplay } from "../../stores/tankopediaPersistent/constants";
import { Armor } from "../Armor";
import { ArmorPlateDisplay } from "../Armor/components/ArmorPlateDisplay";
import { ShotDisplay } from "../Armor/components/ShotDisplay";
import {
  StaticArmor,
  type ThicknessRange,
} from "../Armor/components/StaticArmor";
import { CanvasAutoClear } from "../CanvasAutoClear";
import { CanvasControl } from "../CanvasControl";
import { InitialCameraAligner } from "../InitialCameraAligner";
import { Lighting } from "../Lighting";
import { SceneProps } from "../SceneProps";
import { SmartCanvas } from "../SmartCanvas";
import { TankModel } from "../TankModel";
import styles from "./index.module.css";

interface TankSandboxProps {
  thicknessRange: ThicknessRange;
}

export const TankopediaSandbox = forwardRef<
  HTMLCanvasElement,
  TankSandboxProps
>(({ thicknessRange }, ref) => {
  const canvas = useRef<HTMLCanvasElement>(null);
  const hasImprovedVerticalStabilizer = useEquipment(122);
  const hasDownImprovedVerticalStabilizer = useEquipment(124);

  const tank = useProtagonistTank();
  const gun = useProtagonistGun();
  const turret = useProtagonistTurret();

  const model = Tankopedia.use((state) => state.protagonist.model);
  const turretModelDefinition = model.turrets[turret.id];
  const gunModelDefinition = turretModelDefinition.guns[gun.id];
  const display = Tankopedia.use((state) => state.display);
  const hideTankModelUnderArmor = TankopediaPersistent.use(
    (state) => state.hideTankModelUnderArmor,
  );

  const { hasPbr } = useModel(tank.id);

  useImperativeHandle(ref, () => canvas.current!, []);

  function handlePointerDown() {
    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);
  }
  function handlePointerMove(event: PointerEvent) {
    event.preventDefault();
  }
  function handlePointerUp(event: PointerEvent) {
    event.preventDefault();

    window.removeEventListener("pointermove", handlePointerMove);
    window.removeEventListener("pointerup", handlePointerUp);
  }

  useEffect(() => {
    function handlePoseEvent(pose: Pose) {
      switch (pose) {
        case Pose.HullDown: {
          const [pitch, yaw] = applyPitchYawLimits(
            -Infinity,
            0,
            gunModelDefinition.pitch!,
            turretModelDefinition.yaw,
            hasImprovedVerticalStabilizer,
            hasDownImprovedVerticalStabilizer,
          );

          modelTransformEvent.dispatch({ pitch, yaw });

          break;
        }

        case Pose.FaceHug: {
          const [pitch, yaw] = applyPitchYawLimits(
            Infinity,
            0,
            gunModelDefinition.pitch!,
            turretModelDefinition.yaw,
            hasImprovedVerticalStabilizer,
          );

          modelTransformEvent.dispatch({ pitch, yaw });

          break;
        }

        case Pose.Default:
          const [pitch, yaw] = applyPitchYawLimits(
            0,
            0,
            gunModelDefinition.pitch!,
            turretModelDefinition.yaw,
            hasImprovedVerticalStabilizer,
          );

          modelTransformEvent.dispatch({ pitch, yaw });

          break;
      }
    }

    poseEvent.on(handlePoseEvent);

    return () => {
      poseEvent.off(handlePoseEvent);
    };
  });

  useEffect(() => {
    const [pitch, yaw] = applyPitchYawLimits(
      modelTransformEvent.last!.pitch,
      modelTransformEvent.last!.yaw,
      gunModelDefinition.pitch!,
      turretModelDefinition.yaw,
      hasImprovedVerticalStabilizer,
    );

    modelTransformEvent.dispatch({ pitch, yaw });
  }, [gun, turret]);

  useEffect(() => {
    if (display !== TankopediaDisplay.DynamicArmor) {
      Tankopedia.mutate((draft) => {
        draft.shot = undefined;
      });
    }

    if (display !== TankopediaDisplay.StaticArmor) {
      Tankopedia.mutate((draft) => {
        draft.highlightArmor = undefined;
      });
    }
  }, [display]);

  return (
    <div className={styles.wrapper}>
      <SmartCanvas
        className={styles.canvas}
        resize={{ debounce: 0 }}
        ref={canvas}
        gl={{
          clippingPlanes: [],
          localClippingEnabled: true,
          preserveDrawingBuffer: true,
        }}
        shadows="soft"
        onPointerDown={handlePointerDown}
        onPointerMissed={() => {
          Tankopedia.mutate((draft) => {
            draft.shot = undefined;
            draft.highlightArmor = undefined;
          });
        }}
      >
        <Lighting hasPbr={hasPbr} />

        <SceneProps />
        {(display === TankopediaDisplay.Model ||
          (display === TankopediaDisplay.DynamicArmor &&
            !hideTankModelUnderArmor)) && <TankModel />}

        <ShotDisplay />
        <ArmorPlateDisplay />
        <CanvasAutoClear />

        <Suspense>
          {/* Controls within Suspense to allow for frame-perfect start of camera auto-rotate */}
          <CanvasControl />

          {display === TankopediaDisplay.DynamicArmor && <Armor />}
          {display === TankopediaDisplay.StaticArmor && (
            <StaticArmor thicknessRange={thicknessRange} />
          )}
        </Suspense>

        <InitialCameraAligner />
      </SmartCanvas>
    </div>
  );
});
