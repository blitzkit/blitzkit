import {
  forwardRef,
  Suspense,
  useEffect,
  useImperativeHandle,
  useRef,
} from "react";
import { Fog } from "three";
import { applyPitchYawLimits } from "../../../../../core/blitz/applyPitchYawLimits";
import { modelTransformEvent } from "../../../../../core/blitzkit/modelTransform";
import { Pose, poseEvent } from "../../../../../core/blitzkit/pose";
import { useEquipment } from "../../../../../hooks/useEquipment";
import { useTankModelDefinition } from "../../../../../hooks/useTankModelDefinition";
import { Duel } from "../../../../../stores/duel";
import { Tankopedia } from "../../../../../stores/tankopedia";
import { TankopediaPersistent } from "../../../../../stores/tankopediaPersistent";
import { TankopediaDisplay } from "../../../../../stores/tankopediaPersistent/constants";
import { Armor } from "../../../../Armor";
import { ArmorPlateDisplay } from "../../../../Armor/components/ArmorPlateDisplay";
import { ShotDisplay } from "../../../../Armor/components/ShotDisplay";
import {
  StaticArmor,
  type ThicknessRange,
} from "../../../../Armor/components/StaticArmor";
import { SmartCanvas } from "../../../../SmartCanvas";
import { AutoClear } from "./components/AutoClear";
import { Controls } from "./components/Control";
import { InitialAligner } from "./components/InitialAligner";
import { Lighting } from "./components/Lighting";
import { SceneProps } from "./components/SceneProps";
import { TankModel } from "./components/TankModel";

interface TankSandboxProps {
  thicknessRange: ThicknessRange;
}

export const TankSandbox = forwardRef<HTMLCanvasElement, TankSandboxProps>(
  ({ thicknessRange }, ref) => {
    const canvas = useRef<HTMLCanvasElement>(null);
    const hasImprovedVerticalStabilizer = useEquipment(122);
    const hasDownImprovedVerticalStabilizer = useEquipment(124);
    const protagonistGun = Duel.use((state) => state.protagonist.gun);
    const protagonistTurret = Duel.use((state) => state.protagonist.turret);
    const tankModelDefinition = useTankModelDefinition();
    const turretModelDefinition =
      tankModelDefinition.turrets[protagonistTurret.id];
    const gunModelDefinition = turretModelDefinition.guns[protagonistGun.id];
    const display = Tankopedia.use((state) => state.display);
    const hideTankModelUnderArmor = TankopediaPersistent.use(
      (state) => state.hideTankModelUnderArmor,
    );

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
              gunModelDefinition.pitch,
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
              gunModelDefinition.pitch,
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
              gunModelDefinition.pitch,
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
        gunModelDefinition.pitch,
        turretModelDefinition.yaw,
        hasImprovedVerticalStabilizer,
      );

      modelTransformEvent.dispatch({ pitch, yaw });
    }, [protagonistGun, protagonistTurret]);

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
      <SmartCanvas
        resize={{ debounce: 0 }}
        ref={canvas}
        scene={{ fog: new Fog("black", 30, 50) }}
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
        style={{
          userSelect: "none",
          width: "100%",
          height: "100%",
          outline: undefined,
        }}
      >
        <Lighting />

        <SceneProps />
        {(display === TankopediaDisplay.Model ||
          (display === TankopediaDisplay.DynamicArmor &&
            !hideTankModelUnderArmor)) && <TankModel />}
        <ShotDisplay />
        <ArmorPlateDisplay />
        <AutoClear />

        <Suspense>
          {/* Controls within Suspense to allow for frame-perfect start of camera auto-rotate */}
          <Controls />

          {display === TankopediaDisplay.DynamicArmor && <Armor />}
          {display === TankopediaDisplay.StaticArmor && (
            <StaticArmor thicknessRange={thicknessRange} />
          )}
        </Suspense>

        <InitialAligner />
      </SmartCanvas>
    );
  },
);
