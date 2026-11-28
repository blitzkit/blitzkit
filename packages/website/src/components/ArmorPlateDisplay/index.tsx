import { literals } from "@blitzkit/i18n/src/literals";
import { ReloadIcon } from "@radix-ui/react-icons";
import { Html } from "@react-three/drei";
import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import { radToDeg } from "three/src/math/MathUtils.js";
import { resolveArmorIndex } from "../../core/blitzkit/resolveArmorIndex";
import { LocaleProvider, useLocale } from "../../hooks/useLocale";
import { useStrings } from "../../hooks/useStrings";
import { App } from "../../stores/app";
import { Tankopedia } from "../../stores/tankopedia";
import { Card } from "../Card";
import { Code } from "../Code";
import { IconButton } from "../IconButton";
import { layerTypeNames } from "../ShotCard";
import { ArmorType } from "../SpacedArmorScene";
import { Text } from "../Text";
import { TextField } from "../TextField";
import styles from "./index.module.css";

export function ArmorPlateDisplay() {
  const highlightArmor = Tankopedia.use((state) => state.highlightArmor);
  const developerMode = App.useDeferred((state) => state.developerMode, false);
  const input = useRef<HTMLInputElement>(null);
  const locale = useLocale();
  const strings = useStrings();
  const [draft, setDraft] = useState("");
  const editingName = highlightArmor?.editingPlate
    ? highlightArmor.name
    : undefined;

  // start every edit from the plate's current thickness, focused and selected
  useEffect(() => {
    if (editingName === undefined) return;

    setDraft(Tankopedia.state.highlightArmor!.thickness.toFixed(0));
    input.current?.focus();
    input.current?.select();
  }, [editingName]);

  if (highlightArmor === undefined) return null;

  function handleKeyDown(event: KeyboardEvent) {
    if (!highlightArmor?.editingPlate) return;

    const index = resolveArmorIndex(highlightArmor.name);

    if (index === undefined) return;

    if (event.key === "Escape") {
      input.current?.blur();
      Tankopedia.mutate((draft) => {
        draft.highlightArmor = undefined;
      });
    } else if (event.key === "Enter") {
      const thickness = Number(draft);

      if (draft.trim() === "" || isNaN(thickness) || thickness < 0) return;

      input.current?.blur();
      Tankopedia.mutate((state) => {
        state.highlightArmor = undefined;
        const { protagonist } = state;
        const tank = protagonist.model;
        const turret = tank.turrets[protagonist.turret];
        const gun = turret.guns[protagonist.gun];
        const track = tank.tracks[protagonist.track];

        if (highlightArmor.name.startsWith("hull_")) {
          tank.armor!.thickness[index] = thickness;
        } else if (highlightArmor.name.startsWith("turret_")) {
          turret.armor!.thickness[index] = thickness;
        } else if (highlightArmor.name.startsWith("gun_")) {
          if (highlightArmor.name.includes("_armor_")) {
            gun.armor!.thickness[index] = thickness;
          } else {
            gun.thickness = thickness;
          }
        } else if (highlightArmor.name.startsWith("chassis_")) {
          track.thickness = thickness;
        }
      });
    }
  }

  function handleReset() {
    Tankopedia.mutate((state) => {
      if (!highlightArmor?.editingPlate) return;

      const index = resolveArmorIndex(highlightArmor.name);

      if (index === undefined) return;

      state.highlightArmor = undefined;
      const { protagonist } = state;
      const initial = Tankopedia.initial.protagonist;
      const tank = protagonist.model;
      const initialTank = initial.model;
      const turret = tank.turrets[protagonist.turret];
      const initialTurret = initialTank.turrets[protagonist.turret];
      const gun = turret.guns[protagonist.gun];
      const initialGun = initialTurret.guns[protagonist.gun];
      const track = tank.tracks[protagonist.track];
      const initialTrack = initialTank.tracks[protagonist.track];

      if (highlightArmor.name.startsWith("hull_")) {
        tank.armor!.thickness[index] = initialTank.armor!.thickness[index];
      } else if (highlightArmor.name.startsWith("turret_")) {
        turret.armor!.thickness[index] = initialTurret.armor!.thickness[index];
      } else if (highlightArmor.name.startsWith("gun_")) {
        if (highlightArmor.name.includes("_armor_")) {
          gun.armor!.thickness[index] = initialGun.armor!.thickness[index];
        } else {
          gun.thickness = initialGun.thickness;
        }
      } else if (highlightArmor.name.startsWith("chassis_")) {
        track.thickness = initialTrack.thickness;
      }
    });
  }

  return (
    <group position={highlightArmor.point}>
      <Html
        center
        style={{ pointerEvents: highlightArmor.editingPlate ? "auto" : "none" }}
      >
        <LocaleProvider locale={locale}>
          <Card className={styles.card} style={{ color: highlightArmor.color }}>
            <div className={styles.info}>
              <div className={styles.title}>
                <Text weight="bold" style={{ color: "inherit" }}>
                  {
                    strings.tanks.shot_card.element[
                      layerTypeNames[highlightArmor.type]
                    ]
                  }{" "}
                  {literals(strings.common.units.mm, {
                    value: highlightArmor.thickness.toFixed(0),
                  })}
                </Text>

                {highlightArmor.type !== ArmorType.External && (
                  <Text lowContrast>
                    {literals(strings.common.units.mm, {
                      value: highlightArmor.thicknessAngled.toFixed(0),
                    })}{" "}
                    {literals(strings.common.units.deg, {
                      value: radToDeg(highlightArmor.angle).toFixed(0),
                    })}
                  </Text>
                )}
              </div>

              {developerMode && (
                <Text lowContrast>
                  <b>DEV:</b> <Code lowContrast>{highlightArmor.name}</Code>
                </Text>
              )}
            </div>

            {highlightArmor.editingPlate && (
              <div className={styles.edit}>
                <TextField
                  ref={input}
                  className={styles.input}
                  variant="form"
                  align="right"
                  inputMode="numeric"
                  value={draft}
                  onChange={(event) => setDraft(event.target.value)}
                  onKeyDown={handleKeyDown}
                  onClick={(event) => event.stopPropagation()}
                />

                <IconButton
                  color="red"
                  variant="soft"
                  size="minor"
                  evenPadding
                  onClick={handleReset}
                >
                  <ReloadIcon />
                </IconButton>
              </div>
            )}
          </Card>
        </LocaleProvider>
      </Html>
    </group>
  );
}
