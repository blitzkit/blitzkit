import { alias, romanize, uniqueGuns } from "@blitzkit/core";
import { literals } from "@blitzkit/i18n";
import { useMemo } from "react";
import { useAbsoluteDisplay } from "../../hooks/useAbsoluteDisplay";
import { useDuelModules } from "../../hooks/useDuelModules";
import { useEquipment } from "../../hooks/useEquipment";
import { useStrings } from "../../hooks/useStrings";
import { useUnwrapper } from "../../hooks/useUnwrapper";
import { Tankopedia } from "../../stores/tankopedia";
import { TankopediaDisplay } from "../../stores/tankopediaPersistent/constants";
import type { ComputedCharacteristics } from "../../types/characteristics";
import { CustomShellButton } from "../CustomShellButton";
import { EqualIcon } from "../EqualIcon";
import { IconButton } from "../IconButton";

import { Discriminator } from "../Discriminator";
import { Text } from "../Text";
import { Tooltip } from "../Tooltip";
import styles from "./index.module.css";

interface TankopediaAntagonistControlProps {
  antagonistCharacteristics: ComputedCharacteristics;
}

export function TankopediaAntagonistControl({
  antagonistCharacteristics,
}: TankopediaAntagonistControlProps) {
  const strings = useStrings();
  const unwrap = useUnwrapper();

  const showControls = Tankopedia.use((state) => state.showControls);
  const isDynamicArmorDisplay = useAbsoluteDisplay(
    TankopediaDisplay.DynamicArmor,
  );
  const hasCustomShell = Tankopedia.use(
    (state) => state.customShell !== undefined,
  );
  const equalize = Tankopedia.use((state) => state.environment.equalize);

  const hasCalibratedShells = useEquipment("antagonist", 103);
  const hasEnhancedArmor = useEquipment("protagonist", 110);

  const protagonist = useDuelModules("antagonist");

  const antagonistUniqueGuns = useMemo(
    () => uniqueGuns(protagonist.tank.turrets),
    [protagonist.tank.turrets],
  );

  const isVisible = showControls && isDynamicArmorDisplay;

  return (
    <div className={styles["antagonist-control"]} data-visible={isVisible}>
      <Text lowContrast>
        {literals(strings.common.units.mm, {
          value: (
            antagonistCharacteristics.get("penetration") as number
          ).toFixed(0),
        })}
      </Text>

      {antagonistUniqueGuns.length > 1 && (
        <div className={styles.group}>
          {[...antagonistUniqueGuns].reverse().map((entry) => {
            const selected = entry.gun.id === protagonist.gun.id;
            const name = unwrap(entry.gun.name!);

            return (
              <Tooltip key={entry.gun.id} tooltip={name} side="left">
                <IconButton
                  className={styles["gun-button"]}
                  parentListChild="vertical"
                  color={selected ? undefined : "gray"}
                  variant={selected ? "solid" : "soft"}
                  highContrast={selected}
                  size="major"
                  onClick={() => {
                    Tankopedia.mutate((draft) => {
                      draft.antagonist.turret = entry.turret.id;
                      draft.antagonist.gun = entry.gun.id;
                      draft.antagonist.shell = entry.gun.shells[0].id;
                      draft.shot = undefined;
                      draft.customShell = undefined;
                    });
                  }}
                >
                  <img
                    alt={name}
                    src={alias("api", "/icons/modules/gun.webp")}
                  />

                  <Discriminator>{romanize(entry.gun.tier)}</Discriminator>
                </IconButton>
              </Tooltip>
            );
          })}
        </div>
      )}

      <div className={styles.group}>
        {protagonist.gun.shells.map((thisShell) => {
          const selected =
            thisShell.id === protagonist.shell.id && !hasCustomShell;
          const name = unwrap(thisShell.name!);

          return (
            <Tooltip key={thisShell.id} tooltip={name} side="left">
              <IconButton
                parentListChild="vertical"
                color={selected ? undefined : "gray"}
                variant={selected ? "solid" : "soft"}
                highContrast={selected}
                size="major"
                onClick={() => {
                  Tankopedia.mutate((draft) => {
                    draft.antagonist.shell = thisShell.id;
                    draft.shot = undefined;
                    draft.customShell = undefined;
                  });
                }}
              >
                <img
                  alt={name}
                  src={alias("api", `/icons/shells/${thisShell.icon}.webp`)}
                />
              </IconButton>
            </Tooltip>
          );
        })}

        <CustomShellButton />
      </div>

      <div className={styles.group}>
        <Tooltip
          tooltip={strings.tanks.antagonist_control.calibrated_shells}
          side="left"
        >
          <IconButton
            parentListChild="vertical"
            color={hasCalibratedShells ? undefined : "gray"}
            variant={hasCalibratedShells ? "solid" : "soft"}
            highContrast={hasCalibratedShells}
            size="major"
            onClick={() => {
              Tankopedia.mutate((draft) => {
                draft.shot = undefined;

                if (hasCalibratedShells) {
                  delete draft.antagonist.equipment[0];
                } else {
                  draft.antagonist.equipment[0] = 1;
                }
              });
            }}
          >
            <img
              alt={strings.tanks.antagonist_control.calibrated_shells}
              src={alias("api", "/icons/equipment/103.webp")}
            />
          </IconButton>
        </Tooltip>

        <Tooltip
          tooltip={strings.tanks.antagonist_control.enhanced_armor}
          side="left"
        >
          <IconButton
            parentListChild="vertical"
            color={hasEnhancedArmor ? undefined : "gray"}
            variant={hasEnhancedArmor ? "solid" : "soft"}
            highContrast={hasEnhancedArmor}
            size="major"
            onClick={() => {
              Tankopedia.mutate((draft) => {
                draft.shot = undefined;

                if (hasEnhancedArmor) {
                  delete draft.protagonist.equipment[4];
                } else {
                  draft.protagonist.equipment[4] = 0;
                }
              });
            }}
          >
            <img
              alt={strings.tanks.antagonist_control.enhanced_armor}
              src={alias("api", "/icons/equipment/110.webp")}
            />
          </IconButton>
        </Tooltip>
      </div>

      <Tooltip tooltip={strings.tanks.antagonist_control.equalize} side="left">
        <IconButton
          color={equalize ? undefined : "gray"}
          variant={equalize ? "solid" : "soft"}
          highContrast={equalize}
          size="major"
          onClick={() => {
            Tankopedia.mutate((draft) => {
              draft.environment.equalize = !draft.environment.equalize;
              draft.shot = undefined;
            });
          }}
        >
          <EqualIcon />
        </IconButton>
      </Tooltip>
    </div>
  );
}
