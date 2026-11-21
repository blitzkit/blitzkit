import { HeightIcon, WidthIcon } from "@radix-ui/react-icons";
import type { QuicklimeEvent } from "quicklime";
import { useEffect, useState, type KeyboardEvent, type ReactNode } from "react";
import { degToRad, radToDeg } from "three/src/math/MathUtils.js";
import { applyPitchYawLimits } from "../../core/blitz/applyPitchYawLimits";
import {
  modelTransformEvent,
  type ModelTransformEventData,
} from "../../core/blitzkit/modelTransform";
import { useDuelModel } from "../../hooks/useDuelModel";
import { useEquipment } from "../../hooks/useEquipment";
import { Tankopedia } from "../../stores/tankopedia";
import { TextField } from "../TextField";
import styles from "./index.module.css";

interface AngleFieldProps {
  /** Degrees */
  value: number;
  /** Receives degrees */
  onCommit(value: number): void;
  children: ReactNode;
}

function AngleField({ children, value, onCommit }: AngleFieldProps) {
  const [text, setText] = useState(value.toFixed(1));
  const [editing, setEditing] = useState(false);

  // follow the tank while dragging, but never fight the user mid-typing
  useEffect(() => {
    if (!editing) setText(value.toFixed(1));
  }, [value, editing]);

  function commit(input: HTMLInputElement) {
    const parsed = Number(text);

    if (text.trim() !== "" && Number.isFinite(parsed)) onCommit(parsed);

    setEditing(false);
    setText(value.toFixed(1));
    input.blur();
  }

  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    // keep tankopedia hotkeys from firing while typing
    event.stopPropagation();

    const input = event.target as HTMLInputElement;

    if (event.key === "Enter") {
      commit(input);
    } else if (event.key === "Escape") {
      setEditing(false);
      setText(value.toFixed(1));
      input.blur();
    }
  }

  return (
    <TextField
      autoWidth
      size="minor"
      align="right"
      value={text}
      childrenAsSuffix
      onFocus={(event) => {
        setEditing(true);
        (event.target as HTMLInputElement).select?.();
      }}
      onBlur={(event) => commit(event.target as HTMLInputElement)}
      onKeyDown={handleKeyDown}
      onChange={(event) => setText(event.target.value)}
    >
      {children}
    </TextField>
  );
}

export function TankopediaQuickInputs() {
  const protagonist = Tankopedia.use((state) => state.protagonist);
  const showControls = Tankopedia.use((state) => state.showControls);

  const tankModelDefinition = useDuelModel("protagonist");
  const turretModelDefinition = tankModelDefinition.turrets[protagonist.turret];
  const gunModelDefinition = turretModelDefinition.guns[protagonist.gun];
  const initialTurretPitch =
    tankModelDefinition.initial_turret_rotation?.pitch ?? 0;

  const hasImprovedVerticalStabilizer = useEquipment("protagonist", 122);
  const hasDownImprovedVerticalStabilizer = useEquipment("protagonist", 124);

  const [transform, setTransform] = useState(modelTransformEvent.last!);

  useEffect(() => {
    function handleTransform(event: QuicklimeEvent<ModelTransformEventData>) {
      setTransform(event.data);
    }

    modelTransformEvent.on(handleTransform);
    setTransform(modelTransformEvent.last!);

    return () => {
      modelTransformEvent.off(handleTransform);
    };
  }, []);

  function apply(pitch: number, yaw: number) {
    const [limitedPitch, limitedYaw] = applyPitchYawLimits(
      pitch,
      yaw,
      gunModelDefinition.pitch!,
      turretModelDefinition.yaw,
      hasImprovedVerticalStabilizer,
      hasDownImprovedVerticalStabilizer,
    );

    modelTransformEvent.dispatch({ pitch: limitedPitch, yaw: limitedYaw });
  }

  return (
    <div className={styles["quick-inputs"]} data-visible={showControls}>
      <AngleField
        value={radToDeg(transform.yaw)}
        onCommit={(value) => apply(transform.pitch, degToRad(value))}
      >
        <WidthIcon />
      </AngleField>

      <AngleField
        value={radToDeg(transform.pitch) - initialTurretPitch}
        onCommit={(value) =>
          apply(degToRad(value + initialTurretPitch), transform.yaw)
        }
      >
        <HeightIcon />
      </AngleField>
    </div>
  );
}
