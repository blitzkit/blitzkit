import { alias } from "@blitzkit/core";
import { type Strings } from "@blitzkit/i18n";
import { literals } from "@blitzkit/i18n/src/literals";
import { ShellType } from "@blitzkit/protos";
import { CaretDownIcon, DotFilledIcon } from "@radix-ui/react-icons";
import { throttle } from "lodash-es";
import { useEffect, useMemo, useState, type KeyboardEvent } from "react";
import { DuelModule, useDuel } from "../../hooks/useDuel";
import { useStrings } from "../../hooks/useStrings";
import { Tankopedia } from "../../stores/tankopedia";
import { Button } from "../Button";
import { IconButton } from "../IconButton";
import { Popover } from "../Popover";
import { Select } from "../Select";
import { Slider } from "../Slider";
import { Text } from "../Text";
import { TextField } from "../TextField";
import { Tooltip } from "../Tooltip";
import styles from "./index.module.css";

interface NumberFieldProps {
  value: number;
  suffix: string;
  onValueChange(value: number): void;
}

/** Text field that only commits valid numbers and reverts on Escape */
function NumberField({ value, suffix, onValueChange }: NumberFieldProps) {
  const [text, setText] = useState(`${value}`);

  useEffect(() => setText(`${value}`), [value]);

  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    // keep tankopedia hotkeys from firing while typing
    event.stopPropagation();

    const input = event.target as HTMLInputElement;

    if (event.key === "Enter") {
      input.blur();
    } else if (event.key === "Escape") {
      setText(`${value}`);
      onValueChange(value);
      input.blur();
    }
  }

  return (
    <TextField
      className={styles.field}
      variant="form"
      align="right"
      value={text}
      onFocus={(event) => (event.target as HTMLInputElement).select?.()}
      onKeyDown={handleKeyDown}
      onChange={(event) => {
        setText(event.target.value);

        const parsed = Number(event.target.value);
        if (event.target.value.trim() !== "" && Number.isFinite(parsed)) {
          onValueChange(parsed);
        }
      }}
      childrenAsSuffix
    >
      <Text lowContrast>{suffix}</Text>
    </TextField>
  );
}

const COMMON_SHELLS: [ShellType, keyof Strings["common"]["shells"]][] = [
  [ShellType.SHELL_TYPE_AP, "ap"],
  [ShellType.SHELL_TYPE_APCR, "ap_cr"],
  [ShellType.SHELL_TYPE_HEAT, "hc"],
  [ShellType.SHELL_TYPE_HE, "he"],
];

export function CustomShellButton() {
  const customShell = Tankopedia.use((state) => state.customShell);
  const gun = useDuel("protagonist", DuelModule.Gun);
  const antagonistGun = useDuel("antagonist", DuelModule.Gun);
  const antagonistShell = useDuel("antagonist", DuelModule.Shell);
  const strings = useStrings();

  const mm = literals(strings.common.units.mm, { value: "" });
  const setRicochet = useMemo(
    () =>
      throttle((value: number) => {
        Tankopedia.mutate((draft) => {
          draft.customShell!.ricochet = value;
        });
      }, 1000),
    [],
  );

  return (
    <Popover.Root
      onOpenChange={(open) => {
        if (!open || customShell) return;

        Tankopedia.mutate((draft) => {
          draft.customShell = antagonistShell;
        });
      }}
    >
      <Tooltip tooltip={strings.tanks.custom_shell.title} side="left">
        <Popover.Trigger asChild>
          <IconButton
            listChild="vertical"
            color={customShell ? undefined : "gray"}
            variant={customShell ? "solid" : "soft"}
            highContrast={customShell !== undefined}
            size="major"
          >
            <img
              alt={strings.tanks.custom_shell.title}
              src="/assets/images/icons/custom-shell.png"
            />
          </IconButton>
        </Popover.Trigger>
      </Tooltip>

      <Popover.Portal>
        <Popover.Content side="left" align="center">
          {customShell && (
            <>
              <div className={styles.form}>
                <div className={styles.row}>
                  <Text>{strings.tanks.custom_shell.type}</Text>

                  <Select.Root
                    value={`${customShell.type}`}
                    onValueChange={(value) => {
                      const type = Number(value) as ShellType;
                      const modified = { ...customShell, type };

                      switch (type) {
                        case ShellType.SHELL_TYPE_AP: {
                          modified.normalization = 5;
                          modified.ricochet = 70;
                          modified.explosion_radius = undefined;
                          break;
                        }

                        case ShellType.SHELL_TYPE_APCR: {
                          modified.normalization = 2;
                          modified.ricochet = 70;
                          modified.explosion_radius = undefined;
                          break;
                        }

                        case ShellType.SHELL_TYPE_HEAT: {
                          modified.normalization = undefined;
                          modified.ricochet = undefined;
                          modified.explosion_radius = undefined;
                          break;
                        }

                        case ShellType.SHELL_TYPE_HE: {
                          modified.normalization = undefined;
                          modified.ricochet = undefined;
                          modified.explosion_radius =
                            gun.shells.find(
                              (shell) => shell.type === ShellType.SHELL_TYPE_HE,
                            )?.explosion_radius ?? 1;
                          break;
                        }
                      }

                      Tankopedia.mutate((draft) => {
                        draft.customShell = modified;
                      });
                    }}
                  >
                    <Select.Trigger>
                      <Select.Value />

                      <Select.Icon>
                        <CaretDownIcon />
                      </Select.Icon>
                    </Select.Trigger>

                    <Select.Portal>
                      <Select.Content>
                        <Select.Viewport>
                          {COMMON_SHELLS.map(([type, label]) => {
                            return (
                              <Select.Item key={type} value={`${type}`}>
                                <Select.ItemIndicator>
                                  <DotFilledIcon />
                                </Select.ItemIndicator>

                                <Select.ItemText className="TEST_CLASS">
                                  {strings.common.shells[label]}

                                  <img
                                    alt={strings.common.shells[label]}
                                    src={alias(
                                      "api",
                                      `/icons/shells/${label}.webp`,
                                    )}
                                  />
                                </Select.ItemText>
                              </Select.Item>
                            );
                          })}
                        </Select.Viewport>
                      </Select.Content>
                    </Select.Portal>
                  </Select.Root>
                </div>

                <div className={styles.row}>
                  <Text>{strings.tanks.custom_shell.caliber}</Text>
                  <NumberField
                    value={customShell.caliber}
                    suffix={mm}
                    onValueChange={(value) => {
                      Tankopedia.mutate((draft) => {
                        draft.customShell!.caliber = value;
                      });
                    }}
                  />
                </div>

                <div className={styles.row}>
                  <Text>{strings.tanks.custom_shell.penetration}</Text>
                  <NumberField
                    value={customShell.penetration!.near}
                    suffix={mm}
                    onValueChange={(value) => {
                      Tankopedia.mutate((draft) => {
                        draft.customShell!.penetration!.near = value;
                      });
                    }}
                  />
                </div>

                {(customShell.type === ShellType.SHELL_TYPE_AP ||
                  customShell.type === ShellType.SHELL_TYPE_APCR) && (
                  <>
                    <div className={styles.row}>
                      <Text>{strings.tanks.custom_shell.normalization}</Text>

                      <div className={styles.slider}>
                        <Text lowContrast>
                          {literals(strings.common.units.deg, {
                            value: (customShell.normalization ?? 0).toFixed(0),
                          })}
                        </Text>
                        <Slider.Root
                          min={0}
                          max={90}
                          step={0.1}
                          defaultValue={[customShell.normalization ?? 0]}
                          onValueChange={([value]) => {
                            Tankopedia.mutate((draft) => {
                              draft.customShell!.normalization = value;
                            });
                          }}
                        >
                          <Slider.Track>
                            <Slider.Range />
                          </Slider.Track>
                          <Slider.Thumb />
                        </Slider.Root>
                      </div>
                    </div>

                    <div className={styles.row}>
                      <Text>{strings.tanks.custom_shell.ricochet}</Text>

                      <div className={styles.slider}>
                        <Text lowContrast>
                          {literals(strings.common.units.deg, {
                            value: (customShell.ricochet ?? 90).toFixed(0),
                          })}
                        </Text>
                        <Slider.Root
                          min={0}
                          max={90}
                          step={0.1}
                          defaultValue={[customShell.ricochet ?? 90]}
                          onValueChange={([value]) => setRicochet(value)}
                        >
                          <Slider.Track>
                            <Slider.Range />
                          </Slider.Track>
                          <Slider.Thumb />
                        </Slider.Root>
                      </div>
                    </div>
                  </>
                )}

                {customShell.type === ShellType.SHELL_TYPE_HE && (
                  <div className={styles.row}>
                    <Text>{strings.tanks.custom_shell.explosion_radius}</Text>
                    <NumberField
                      value={customShell.explosion_radius ?? 0}
                      suffix="m"
                      onValueChange={(value) => {
                        Tankopedia.mutate((draft) => {
                          draft.customShell!.explosion_radius = value;
                        });
                      }}
                    />
                  </div>
                )}
              </div>

              <div className={styles.actions}>
                <Popover.Close asChild>
                  <Button color="red" variant="outline">
                    {strings.tanks.custom_shell.exit}
                  </Button>
                </Popover.Close>

                <Button
                  color="red"
                  onClick={() => {
                    Tankopedia.mutate((draft) => {
                      draft.customShell = antagonistShell;
                    });
                  }}
                >
                  {strings.tanks.custom_shell.reset}
                </Button>
              </div>
            </>
          )}
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}
