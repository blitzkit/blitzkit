import { alias, romanize, uniqueGuns } from "@blitzkit/core";
import { literals } from "@blitzkit/i18n";
import { Popover } from "radix-ui";
import { useMemo } from "react";
import { DuelModule, useDuel } from "../../hooks/useDuel";
import { useEquipment } from "../../hooks/useEquipment";
import { useStrings } from "../../hooks/useStrings";
import { useUnwrapper } from "../../hooks/useUnwrapper";
import { Tankopedia } from "../../stores/tankopedia";
import { TankopediaDisplay } from "../../stores/tankopediaPersistent/constants";
import type { ComputedCharacteristics } from "../../types/characteristics";
import { EqualIcon } from "../EqualIcon";
import { IconButton } from "../IconButton";
import { CustomShellButton } from "../TankopediaOptions/components/CustomShellButton";
import { Text } from "../Text";
import styles from "./index.module.css";

interface TankopediaAntagonistControlProps {
  antagonistCharacteristics: ComputedCharacteristics;
}

export function TankopediaAntagonistControl({
  antagonistCharacteristics,
}: TankopediaAntagonistControlProps) {
  const strings = useStrings();
  const unwrap = useUnwrapper();

  const requestedDisplay = Tankopedia.use((state) => state.requestedDisplay);
  const hasCustomShell = Tankopedia.use(
    (state) => state.customShell !== undefined,
  );
  const equalize = Tankopedia.use((state) => state.environment.equalize);

  const hasCalibratedShells = useEquipment("protagonist", 103);
  const hasEnhancedArmor = useEquipment("protagonist", 110);

  const tank = useDuel("antagonist", DuelModule.Tank);
  const gun = useDuel("antagonist", DuelModule.Gun);
  const shell = useDuel("antagonist", DuelModule.Shell);

  const antagonistUniqueGuns = useMemo(
    () => uniqueGuns(tank.turrets),
    [tank.turrets],
  );

  const isVisible = requestedDisplay === TankopediaDisplay.DynamicArmor;

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
        <Popover.Root>
          <Popover.Trigger>
            <IconButton
              radius="full"
              variant="soft"
              color="gray"
              size={{ initial: "2", sm: "3" }}
              style={{ position: "relative" }}
            >
              <Text
                size="1"
                color="gray"
                style={{
                  position: "absolute",
                  right: 0,
                  bottom: 0,
                }}
                mr="2"
                mb="1"
              >
                {romanize(gun.tier)}
              </Text>

              <img
                alt="Antagonist Gun"
                src={alias("api", "/icons/modules/gun.webp")}
                style={{
                  width: "65%",
                  height: "65%",
                  objectFit: "contain",
                }}
              />
            </IconButton>
          </Popover.Trigger>

          <Popover.Content side="left" align="center">
            <div>
              {[...antagonistUniqueGuns].reverse().map(({ gun, turret }) => (
                <IconButton key={gun.id}>
                  <img src={alias("api", "/icons/modules/gun.webp")} />
                </IconButton>
                // <ModuleButton
                //   module="gun"
                //   key={gun.id}
                //   onClick={() => {
                //     Tankopedia.mutate((draft) => {
                //       draft.antagonist.turret = turret.id;
                //       draft.antagonist.gun = gun.id;
                //       draft.antagonist.shell = gun.shells[0].id;
                //     });
                //   }}
                //   selected={gun.id === antagonistGun.id}
                //   discriminator={romanize(gun.tier)}
                //   secondaryDiscriminator={
                //     <Text style={{ fontSize: "0.75em" }}>
                //       {literals(strings.common.units.mm, {
                //         value: gun.shells[0].caliber.toFixed(0),
                //       })}
                //     </Text>
                //   }
                // />
              ))}
            </div>
          </Popover.Content>
        </Popover.Root>
      )}

      <div>
        {gun.shells.map((thisShell) => (
          <IconButton
            key={thisShell.id}
            selected={thisShell.id === shell.id && !hasCustomShell}
            alt={unwrap(thisShell.name!)}
            src={alias("api", `/icons/shells/${thisShell.icon}.webp`)}
            onClick={() => {
              Tankopedia.mutate((draft) => {
                draft.antagonist.shell = thisShell.id;
                draft.shot = undefined;
                draft.customShell = undefined;
              });
            }}
          />
        ))}
        <CustomShellButton />
      </div>

      <div
        direction="column"
        style={{
          pointerEvents: "auto",
          borderRadius: "var(--radius-full)",
        }}
        overflow="hidden"
      >
        <IconButton
          color={hasCalibratedShells ? undefined : "gray"}
          variant="soft"
          size={{ initial: "2", sm: "3" }}
          radius="none"
          onClick={() => {
            Tankopedia.mutate((draft) => {
              draft.shot = undefined;

              if (hasCalibratedShells) {
                delete draft.protagonist.equipment[0];
              } else {
                draft.antagonist.equipment[0] = 1;
              }
            });
          }}
        >
          <img
            src={alias("api", "/icons/equipment/103.webp")}
            style={{
              width: "50%",
              height: "50%",
            }}
          />
        </IconButton>
        <IconButton
          color={hasEnhancedArmor ? undefined : "gray"}
          variant="soft"
          size={{ initial: "2", sm: "3" }}
          radius="none"
          onClick={() => {
            Tankopedia.mutate((draft) => {
              if (hasEnhancedArmor) {
                delete draft.protagonist.equipment[4];
              } else {
                draft.antagonist.equipment[4] = 0;
              }

              draft.shot = undefined;
            });
          }}
        >
          <img
            alt="Enhanced Armor"
            src={alias("api", "/icons/equipment/110.webp")}
            style={{
              width: "50%",
              height: "50%",
            }}
          />
        </IconButton>
      </div>

      <IconButton
        variant="soft"
        size={{ initial: "2", sm: "3" }}
        color={equalize ? undefined : "gray"}
        onClick={() => {
          Tankopedia.mutate((draft) => {
            draft.environment.equalize = !draft.environment.equalize;
            draft.shot = undefined;
          });
        }}
      >
        <EqualIcon />
      </IconButton>
    </div>
  );
}
