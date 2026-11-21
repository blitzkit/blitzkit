import { literals } from "@blitzkit/i18n/src/literals";
import { EyeClosedIcon, EyeOpenIcon } from "@radix-ui/react-icons";
import { useCallback, type ReactNode } from "react";
import { useAbsoluteDisplay } from "../../hooks/useAbsoluteDisplay";
import { useStrings } from "../../hooks/useStrings";
import { Tankopedia } from "../../stores/tankopedia";
import { TankopediaPersistent } from "../../stores/tankopediaPersistent";
import { TankopediaDisplay } from "../../stores/tankopediaPersistent/constants";
import type { ThicknessRange } from "../TankStaticArmor";
import { Text } from "../Text";
import styles from "./index.module.css";

interface LayerToggleProps {
  visible: boolean;
  label: ReactNode;
  /** Thickness labels for the top and bottom of the scale */
  range?: [ReactNode, ReactNode];
  swatch: string;
  onToggle(): void;
}

function LayerToggle({
  visible,
  label,
  range,
  swatch,
  onToggle,
}: LayerToggleProps) {
  return (
    <button
      className={styles.toggle}
      data-visible={visible}
      data-scaled={range !== undefined}
      onClick={onToggle}
    >
      <div className={styles.labels}>
        {range && (
          <Text size="minor" lowContrast>
            {range[0]}
          </Text>
        )}

        <Text size="minor">{label}</Text>

        {range && (
          <Text size="minor" lowContrast>
            {range[1]}
          </Text>
        )}
      </div>

      <div className={styles.swatch} style={{ background: swatch }}>
        {visible ? <EyeOpenIcon /> : <EyeClosedIcon />}
      </div>
    </button>
  );
}

export interface ThicknessesProps {
  thicknessRange: ThicknessRange;
}

export function Thicknesses({ thicknessRange }: ThicknessesProps) {
  const strings = useStrings();
  const isStaticArmorDisplay = useAbsoluteDisplay(
    TankopediaDisplay.StaticArmor,
  );
  const showControls = Tankopedia.use((state) => state.showControls);
  const showPrimaryArmor = TankopediaPersistent.use(
    (state) => state.showPrimaryArmor,
  );
  const showSpacedArmor = TankopediaPersistent.use(
    (state) => state.showSpacedArmor,
  );
  const showExternalModules = TankopediaPersistent.use(
    (state) => state.showExternalModules,
  );
  const { element } = strings.tanks.shot_card;
  const mm = useCallback(
    (value: number) =>
      literals(strings.common.units.mm, { value: value.toFixed(0) }),
    [strings],
  );
  const clearHighlight = useCallback(() => {
    Tankopedia.mutate((draft) => {
      draft.highlightArmor = undefined;
    });
  }, []);

  return (
    <div
      className={styles.thicknesses}
      data-visible={showControls && isStaticArmorDisplay}
    >
      <LayerToggle
        visible={showPrimaryArmor}
        label={element.primary}
        range={[mm(thicknessRange.value * 1.5), mm(0)]}
        swatch="linear-gradient(rgb(64, 0, 0), rgb(255, 0, 0) 33%, rgb(255, 255, 0) 66%, rgb(0, 255, 0))"
        onToggle={() => {
          TankopediaPersistent.mutate((draft) => {
            draft.showPrimaryArmor = !draft.showPrimaryArmor;
          });
          clearHighlight();
        }}
      />

      <LayerToggle
        visible={showSpacedArmor}
        label={element.spaced}
        range={[mm(thicknessRange.value), mm(0)]}
        swatch="linear-gradient(rgb(32, 0, 225), rgb(255, 0, 255))"
        onToggle={() => {
          TankopediaPersistent.mutate((draft) => {
            draft.showSpacedArmor = !draft.showSpacedArmor;
          });
          clearHighlight();
        }}
      />

      <LayerToggle
        visible={showExternalModules}
        label={element.external}
        swatch="#c0c0c0"
        onToggle={() => {
          TankopediaPersistent.mutate((draft) => {
            draft.showExternalModules = !draft.showExternalModules;
          });
          clearHighlight();
        }}
      />
    </div>
  );
}
