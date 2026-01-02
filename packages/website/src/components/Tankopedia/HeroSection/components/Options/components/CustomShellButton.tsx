import { ShellType } from "@blitzkit/core";
import { literals } from "@blitzkit/i18n/src/literals";
import {
  Button,
  Flex,
  IconButton,
  Popover,
  Select,
  Slider,
  Text,
  TextField,
} from "@radix-ui/themes";
import { throttle } from "lodash-es";
import { type ChangeEvent } from "react";
import { useLocale } from "../../../../../../hooks/useLocale";
import { Duel } from "../../../../../../stores/duel";
import { Tankopedia } from "../../../../../../stores/tankopedia";

export function CustomShellButton() {
  const customShell = Tankopedia.use((state) => state.customShell);
  const gun = Duel.use((state) => state.protagonist.gun);
  const antagonistShell = Duel.use((state) => state.antagonist.shell);
  const { strings } = useLocale();

  return (
    <Popover.Root
      onOpenChange={(open) => {
        if (!open || customShell) return;

        Tankopedia.mutate((draft) => {
          draft.customShell = antagonistShell;
        });
      }}
    >
      <Popover.Trigger>
        <IconButton
          color={customShell ? undefined : "gray"}
          variant="soft"
          size={{ initial: "2", sm: "3" }}
          radius="none"
        >
          <img
            alt="custom shell"
            src="/assets/images/icons/custom-shell.png"
            style={{
              width: "50%",
              height: "50%",
            }}
          />
        </IconButton>
      </Popover.Trigger>

      <Popover.Content>
        {customShell && (
          <>
            <Flex direction="column" gap="2">
              <Flex align="center" justify="between" gap="4">
                <Text>
                  {
                    strings.website.tools.tankopedia.sandbox.dynamic
                      .custom_shell.type
                  }
                </Text>
                <Select.Root
                  value={`${customShell.type}`}
                  onValueChange={(value) => {
                    const type = Number(value) as ShellType;
                    const modified = { ...customShell, type };

                    switch (type) {
                      case ShellType.AP: {
                        modified.normalization = 5;
                        modified.ricochet = 70;
                        modified.explosion_radius = undefined;
                        break;
                      }
                      case ShellType.APCR: {
                        modified.normalization = 2;
                        modified.ricochet = 70;
                        modified.explosion_radius = undefined;
                        break;
                      }
                      case ShellType.HEAT: {
                        modified.normalization = undefined;
                        modified.ricochet = undefined;
                        modified.explosion_radius = undefined;
                      }
                      case ShellType.HE: {
                        modified.normalization = undefined;
                        modified.ricochet = undefined;
                        modified.explosion_radius =
                          gun.shells.find(
                            (shell) => shell.type === ShellType.HE
                          )?.explosion_radius ?? 1;
                        break;
                      }
                    }

                    Tankopedia.mutate((draft) => {
                      draft.customShell = modified;
                    });
                  }}
                >
                  <Select.Trigger variant="classic" />

                  <Select.Content>
                    <Select.Item value={`${ShellType.AP}`}>
                      {strings.common.shells.ap}
                    </Select.Item>
                    <Select.Item value={`${ShellType.APCR}`}>
                      {strings.common.shells.ap_cr}
                    </Select.Item>
                    <Select.Item value={`${ShellType.HEAT}`}>
                      {strings.common.shells.hc}
                    </Select.Item>
                    <Select.Item value={`${ShellType.HE}`}>
                      {strings.common.shells.he}
                    </Select.Item>
                  </Select.Content>
                </Select.Root>
              </Flex>

              <Flex align="center" justify="between" gap="4">
                <Text>
                  {
                    strings.website.tools.tankopedia.sandbox.dynamic
                      .custom_shell.caliber
                  }
                </Text>
                <TextField.Root
                  variant="classic"
                  style={{ maxWidth: "6rem" }}
                  defaultValue={customShell.caliber}
                  type="number"
                  onChange={(event) => {
                    Tankopedia.mutate((draft) => {
                      draft.customShell!.caliber = event.target.valueAsNumber;
                    });
                  }}
                  onFocus={(event) => event.target.select()}
                  onKeyDown={(event) => {
                    event.stopPropagation();

                    if (event.key === "Enter") {
                      (event.target as HTMLInputElement).blur();
                    } else if (event.key === "Escape") {
                      (event.target as HTMLInputElement).valueAsNumber =
                        customShell.caliber;
                      (event.target as HTMLInputElement).blur();
                    }
                  }}
                >
                  <TextField.Slot side="right">
                    {literals(strings.common.units.mm, { value: "" })}
                  </TextField.Slot>
                </TextField.Root>
              </Flex>

              <Flex align="center" justify="between" gap="4">
                <Text>
                  {
                    strings.website.tools.tankopedia.sandbox.dynamic
                      .custom_shell.penetration
                  }
                </Text>
                <TextField.Root
                  variant="classic"
                  style={{ maxWidth: "6rem" }}
                  defaultValue={customShell.penetration.near}
                  type="number"
                  onChange={(event: ChangeEvent<HTMLInputElement>) => {
                    Tankopedia.mutate((draft) => {
                      draft.customShell!.penetration.near =
                        event.target.valueAsNumber;
                    });
                  }}
                  onFocus={(event) => event.target.select()}
                  onKeyDown={(event) => {
                    event.stopPropagation();

                    if (event.key === "Enter") {
                      (event.target as HTMLInputElement).blur();
                    } else if (event.key === "Escape") {
                      (event.target as HTMLInputElement).valueAsNumber =
                        customShell.penetration.near;
                      (event.target as HTMLInputElement).blur();
                    }
                  }}
                >
                  <TextField.Slot side="right">
                    {literals(strings.common.units.mm, { value: "" })}
                  </TextField.Slot>
                </TextField.Root>
              </Flex>

              {(customShell.type === ShellType.AP ||
                customShell.type === ShellType.APCR) && (
                <>
                  <Flex align="center" justify="between" gap="4" py="1">
                    <Text>
                      {
                        strings.website.tools.tankopedia.sandbox.dynamic
                          .custom_shell.normalization
                      }
                    </Text>

                    <Flex
                      align="center"
                      gap="2"
                      flexGrow="1"
                      maxWidth="15rem"
                      minWidth="8rem"
                    >
                      <Text color="gray">
                        {literals(strings.common.units.deg, {
                          value: (customShell.normalization ?? 0).toFixed(0),
                        })}
                      </Text>
                      <Slider
                        variant="classic"
                        min={0}
                        max={90}
                        step={Number.EPSILON}
                        defaultValue={[customShell.normalization ?? 0]}
                        onValueChange={([value]) => {
                          console.log("asd");

                          Tankopedia.mutate((draft) => {
                            draft.customShell!.normalization = value;
                          });
                        }}
                      />
                    </Flex>
                  </Flex>

                  <Flex align="center" justify="between" gap="4" py="1">
                    <Text>
                      {
                        strings.website.tools.tankopedia.sandbox.dynamic
                          .custom_shell.ricochet
                      }
                    </Text>

                    <Flex align="center" gap="2" flexGrow="1" maxWidth="15rem">
                      <Text color="gray">
                        {literals(strings.common.units.deg, {
                          value: (customShell.ricochet ?? 90).toFixed(0),
                        })}
                      </Text>
                      <Slider
                        variant="classic"
                        min={0}
                        max={90}
                        step={Number.EPSILON}
                        defaultValue={[customShell.ricochet ?? 90]}
                        onValueChange={throttle(([value]) => {
                          Tankopedia.mutate((draft) => {
                            draft.customShell!.ricochet = value;
                          });
                        }, 1000)}
                      />
                    </Flex>
                  </Flex>
                </>
              )}

              {customShell.type === ShellType.HE && (
                <Flex align="center" justify="between" gap="4">
                  <Text>Explosion radius</Text>
                  <TextField.Root
                    variant="classic"
                    style={{ maxWidth: "6rem" }}
                    defaultValue={customShell.explosion_radius ?? 0}
                    type="number"
                    onChange={(event: ChangeEvent<HTMLInputElement>) => {
                      Tankopedia.mutate((draft) => {
                        draft.customShell!.explosion_radius =
                          event.target.valueAsNumber;
                      });
                    }}
                    onFocus={(event) => event.target.select()}
                    onKeyDown={(event) => {
                      event.stopPropagation();

                      if (event.key === "Enter") {
                        (event.target as HTMLInputElement).blur();
                      } else if (event.key === "Escape") {
                        (event.target as HTMLInputElement).valueAsNumber =
                          customShell.explosion_radius ?? 1;
                        (event.target as HTMLInputElement).blur();
                      }
                    }}
                  >
                    <TextField.Slot side="right">m</TextField.Slot>
                  </TextField.Root>
                </Flex>
              )}
            </Flex>

            <Flex justify="end" mt="6" gap="2">
              <Popover.Close>
                <Button color="red" variant="outline">
                  {
                    strings.website.tools.tankopedia.sandbox.dynamic
                      .custom_shell.exit
                  }
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
                {
                  strings.website.tools.tankopedia.sandbox.dynamic.custom_shell
                    .reset
                }
              </Button>
            </Flex>
          </>
        )}
      </Popover.Content>
    </Popover.Root>
  );
}
