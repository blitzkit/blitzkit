import {
  asset,
  ShellType,
  TANK_CLASSES,
  TankType,
  TIER_ROMAN_NUMERALS,
} from "@blitzkit/core";
import { LockClosedIcon, LockOpen2Icon } from "@radix-ui/react-icons";
import {
  Box,
  Flex,
  IconButton,
  Inset,
  Link,
  Popover,
  Text,
  Tooltip,
  type ButtonProps,
  type FlexProps,
} from "@radix-ui/themes";
import { isEqual, times, chunk } from "lodash-es";
import { awaitableGameDefinitions } from "../../../core/awaitables/gameDefinitions";
import { awaitableConsumableDefinitions } from "../../../core/awaitables/consumableDefinitions";
import { Var } from "../../../core/radix/var";
import { useLocale } from "../../../hooks/useLocale";
import { App } from "../../../stores/app";
import { TankFilters } from "../../../stores/tankFilters";
import { TankSort } from "../../../stores/tankopediaSort";
import { classIcons } from "../../ClassIcon";
import { GunAutoloaderIcon } from "../../GunAutoloaderIcon";
import { GunAutoreloaderIcon } from "../../GunAutoreloaderIcon";
import { GunRegularIcon } from "../../GunRegularIcon";
import { MissingShellIcon } from "../../MissingShellIcon";
import { ResearchedIcon } from "../../ResearchedIcon";
import { ScienceIcon } from "../../ScienceIcon";
import { ScienceOffIcon } from "../../ScienceOffIcon";

const gameDefinitions = await awaitableGameDefinitions;
const consumableDefinitions = await awaitableConsumableDefinitions;

const shellTypeIcons: Record<ShellType, string> = {
  [ShellType.AP]: "ap",
  [ShellType.APCR]: "ap_cr",
  [ShellType.HE]: "he",
  [ShellType.HEAT]: "hc",
};

// Get consumables
const regularConsumables = Object.values(
  consumableDefinitions.consumables
).filter(
  (consumable) =>
    !consumable.game_mode_exclusive && consumable.name.locales.en !== ""
);

// Split consumables into chunks of 5 for columns
const consumableColumns = chunk(regularConsumables, 5);

// Get game mode exclusive abilities
const gameModeAbilities = Object.values(
  consumableDefinitions.consumables
).filter((consumable) => consumable.game_mode_exclusive);

// Split abilities into chunks of 5 for columns
const abilityColumns = chunk(gameModeAbilities, 5);

const size: ButtonProps["size"] = { initial: "1", xs: "2" };

function ShellFilter({ index, premium }: { index: number; premium?: boolean }) {
  const shells = TankFilters.use((state) => state.shells);

  return (
    <Popover.Root>
      <Popover.Trigger>
        <IconButton
          size={size}
          variant="soft"
          radius="none"
          color="gray"
          highContrast
        >
          {shells[index] === null && (
            <Text color="gray" style={{ display: "contents" }}>
              <MissingShellIcon width="1em" height="1em" />
            </Text>
          )}
          {shells[index] !== null && (
            <img
              style={{ width: "1em", height: "1em" }}
              src={asset(
                `icons/shells/${shellTypeIcons[shells[index]]}${
                  premium ? "_premium" : ""
                }.webp`
              )}
            />
          )}
        </IconButton>
      </Popover.Trigger>

      <Popover.Content>
        <Inset>
          <Flex>
            {Object.values(ShellType).map((shellType) => {
              if (typeof shellType === "string") return null;

              const selected = shells[index] === shellType;

              return (
                <IconButton
                  size={size}
                  key={shellType}
                  value={`${shellType}`}
                  radius="none"
                  variant={selected ? "solid" : "soft"}
                  onClick={() => {
                    const mutated = [...shells] as TankFilters["shells"];

                    mutated[index] = selected ? null : shellType;

                    TankFilters.mutate((draft) => {
                      draft.shells = mutated;
                    });
                  }}
                  highContrast={selected}
                  color={selected ? undefined : "gray"}
                >
                  <img
                    src={asset(
                      `icons/shells/${shellTypeIcons[shellType]}${
                        premium ? "_premium" : ""
                      }.webp`
                    )}
                    style={{ width: "1em", height: "1em" }}
                  />
                </IconButton>
              );
            })}
          </Flex>
        </Inset>
      </Popover.Content>
    </Popover.Root>
  );
}

function OwnershipFilter(props: FlexProps) {
  const tankFilters = TankFilters.use();
  const wargaming = App.use((state) => state.logins.wargaming);

  return (
    <Flex
      overflow="hidden"
      style={{ borderRadius: "var(--radius-full)" }}
      direction="column"
      {...props}
    >
      <IconButton
        size={size}
        disabled={!wargaming}
        variant={tankFilters.showOwned ? "solid" : "soft"}
        radius="none"
        color={tankFilters.showOwned ? undefined : "gray"}
        highContrast
        onClick={() => {
          TankFilters.mutate((draft) => {
            draft.showOwned = !draft.showOwned;
          });
        }}
      >
        <LockOpen2Icon />
      </IconButton>

      <IconButton
        size={size}
        disabled={!wargaming}
        variant={tankFilters.showUnowned ? "solid" : "soft"}
        radius="none"
        color={tankFilters.showUnowned ? undefined : "gray"}
        highContrast
        onClick={() => {
          TankFilters.mutate((draft) => {
            draft.showUnowned = !draft.showUnowned;
          });
        }}
      >
        <LockClosedIcon />
      </IconButton>
    </Flex>
  );
}

export function FilterControl() {
  const tankFilters = TankFilters.use();
  const { strings } = useLocale();
  const clearable = !isEqual(tankFilters, TankFilters.initial);
  const wargaming = App.use((state) => state.logins.wargaming);

  return (
    <Flex direction="column" align="center">
      <Flex height="fit-content" gap="1" align="start" justify="center">
        <Flex
          flexShrink="0"
          overflow="hidden"
          style={{ borderRadius: "var(--radius-4)" }}
        >
          <Flex direction="column">
            {times(5, (index) => {
              const tier = index + 1;
              const selected = tankFilters.tiers?.includes(tier);

              return (
                <IconButton
                  size={size}
                  key={tier}
                  variant={selected ? "solid" : "soft"}
                  radius="none"
                  color={selected ? undefined : "gray"}
                  highContrast
                  onClick={() => {
                    if (tankFilters.tiers.includes(tier)) {
                      TankFilters.mutate((draft) => {
                        draft.tiers = draft.tiers.filter((t) => t !== tier);
                      });
                    } else {
                      TankFilters.mutate((draft) => {
                        draft.tiers = [...draft.tiers, tier];
                      });
                    }
                  }}
                >
                  <Text size="2">{TIER_ROMAN_NUMERALS[tier]}</Text>
                </IconButton>
              );
            })}
          </Flex>

          <Box
            display={{ initial: "none", md: "block" }}
            style={{
              height: Var("space-1"),
              backgroundColor: Var("gray-a3"),
            }}
          />

          <Flex direction="column">
            {times(5, (index) => {
              const tier = index + 6;
              const selected = tankFilters.tiers?.includes(tier);

              return (
                <IconButton
                  size={size}
                  key={tier}
                  variant={selected ? "solid" : "soft"}
                  radius="none"
                  color={selected ? undefined : "gray"}
                  highContrast
                  onClick={() => {
                    if (tankFilters.tiers.includes(tier)) {
                      TankFilters.mutate((draft) => {
                        draft.tiers = draft.tiers.filter((t) => t !== tier);
                      });
                    } else {
                      TankFilters.mutate((draft) => {
                        draft.tiers = [...draft.tiers, tier];
                      });
                    }
                  }}
                >
                  <Text size="2">{TIER_ROMAN_NUMERALS[tier]}</Text>
                </IconButton>
              );
            })}
          </Flex>
        </Flex>

        <Flex
          flexShrink="0"
          overflow="hidden"
          style={{ borderRadius: "var(--radius-4)" }}
        >
          <Flex direction="column">
            {gameDefinitions.nations
              .slice(0, Math.ceil(gameDefinitions.nations.length / 2))
              .map((nation) => {
                const selected = tankFilters.nations?.includes(nation);

                return (
                  <IconButton
                    size={size}
                    key={nation}
                    variant={selected ? "solid" : "soft"}
                    color={selected ? undefined : "gray"}
                    highContrast
                    radius="none"
                    onClick={() => {
                      TankFilters.mutate((draft) => {
                        if (tankFilters.nations.includes(nation)) {
                          draft.nations = draft.nations.filter(
                            (n) => n !== nation
                          );
                        } else {
                          draft.nations = [...draft.nations, nation];
                        }
                      });
                    }}
                  >
                    <img
                      style={{ width: "1em", height: "1em" }}
                      src={asset(`flags/circle/${nation}.webp`)}
                    />
                  </IconButton>
                );
              })}
          </Flex>

          <Box
            display={{ initial: "none", md: "block" }}
            style={{
              height: Var("space-1"),
              backgroundColor: Var("gray-a3"),
            }}
          />

          <Flex direction="column">
            {gameDefinitions.nations
              .slice(Math.ceil(gameDefinitions.nations.length / 2))
              .map((nation) => {
                const selected = tankFilters.nations?.includes(nation);

                return (
                  <IconButton
                    size={size}
                    key={nation}
                    style={{ flex: 1 }}
                    variant={selected ? "solid" : "soft"}
                    color={selected ? undefined : "gray"}
                    highContrast
                    radius="none"
                    onClick={() => {
                      TankFilters.mutate((draft) => {
                        if (tankFilters.nations.includes(nation)) {
                          draft.nations = draft.nations.filter(
                            (n) => n !== nation
                          );
                        } else {
                          draft.nations = [...draft.nations, nation];
                        }
                      });
                    }}
                  >
                    <img
                      style={{ width: "1em", height: "1em" }}
                      src={asset(`flags/circle/${nation}.webp`)}
                    />
                  </IconButton>
                );
              })}
          </Flex>
        </Flex>

        {/* Consumables Filter - RIGHT AFTER NATIONS */}
        <Flex
          flexShrink="0"
          overflow="hidden"
          style={{ borderRadius: "var(--radius-4)" }}
        >
          <Flex direction="column">
            {consumableColumns[0]?.map((consumable) => {
              const selected = tankFilters.consumables?.includes(consumable.id);

              return (
                <IconButton
                  size={size}
                  key={consumable.id}
                  variant={selected ? "solid" : "soft"}
                  color={selected ? undefined : "gray"}
                  highContrast
                  radius="none"
                  onClick={() => {
                    TankFilters.mutate((draft) => {
                      if (tankFilters.consumables.includes(consumable.id)) {
                        draft.consumables = draft.consumables.filter(
                          (c) => c !== consumable.id
                        );
                      } else {
                        draft.consumables = [
                          ...draft.consumables,
                          consumable.id,
                        ];
                      }
                    });
                  }}
                >
                  <img
                    style={{ width: "1em", height: "1em" }}
                    src={asset(`icons/consumables/${consumable.id}.webp`)}
                  />
                </IconButton>
              );
            })}
          </Flex>

          {consumableColumns[1] && (
            <>
              <Box
                display={{ initial: "none", md: "block" }}
                style={{
                  height: Var("space-1"),
                  backgroundColor: Var("gray-a3"),
                }}
              />

              <Flex direction="column">
                {consumableColumns[1].map((consumable) => {
                  const selected = tankFilters.consumables?.includes(
                    consumable.id
                  );

                  return (
                    <IconButton
                      size={size}
                      key={consumable.id}
                      style={{ flex: 1 }}
                      variant={selected ? "solid" : "soft"}
                      color={selected ? undefined : "gray"}
                      highContrast
                      radius="none"
                      onClick={() => {
                        TankFilters.mutate((draft) => {
                          if (tankFilters.consumables.includes(consumable.id)) {
                            draft.consumables = draft.consumables.filter(
                              (c) => c !== consumable.id
                            );
                          } else {
                            draft.consumables = [
                              ...draft.consumables,
                              consumable.id,
                            ];
                          }
                        });
                      }}
                    >
                      <img
                        style={{ width: "1em", height: "1em" }}
                        src={asset(`icons/consumables/${consumable.id}.webp`)}
                      />
                    </IconButton>
                  );
                })}
              </Flex>
            </>
          )}

          {consumableColumns[2] && (
            <>
              <Box
                display={{ initial: "none", md: "block" }}
                style={{
                  height: Var("space-1"),
                  backgroundColor: Var("gray-a3"),
                }}
              />

              <Flex direction="column">
                {consumableColumns[2].map((consumable) => {
                  const selected = tankFilters.consumables?.includes(
                    consumable.id
                  );

                  return (
                    <IconButton
                      size={size}
                      key={consumable.id}
                      style={{ flex: 1 }}
                      variant={selected ? "solid" : "soft"}
                      color={selected ? undefined : "gray"}
                      highContrast
                      radius="none"
                      onClick={() => {
                        TankFilters.mutate((draft) => {
                          if (tankFilters.consumables.includes(consumable.id)) {
                            draft.consumables = draft.consumables.filter(
                              (c) => c !== consumable.id
                            );
                          } else {
                            draft.consumables = [
                              ...draft.consumables,
                              consumable.id,
                            ];
                          }
                        });
                      }}
                    >
                      <img
                        style={{ width: "1em", height: "1em" }}
                        src={asset(`icons/consumables/${consumable.id}.webp`)}
                      />
                    </IconButton>
                  );
                })}
              </Flex>
            </>
          )}
        </Flex>

        <Flex
          overflow="hidden"
          style={{ borderRadius: "var(--radius-full)" }}
          direction="column"
        >
          {TANK_CLASSES.map((tankClass) => {
            const Icon = classIcons[tankClass];
            const selected = tankFilters.classes?.includes(tankClass);

            return (
              <IconButton
                size={size}
                key={tankClass}
                variant={selected ? "solid" : "soft"}
                radius="none"
                color={selected ? undefined : "gray"}
                highContrast
                onClick={() => {
                  TankFilters.mutate((draft) => {
                    if (tankFilters.classes.includes(tankClass)) {
                      draft.classes = draft.classes.filter(
                        (c) => c !== tankClass
                      );
                    } else {
                      draft.classes = [...draft.classes, tankClass];
                    }
                  });
                }}
              >
                <Icon style={{ width: "1em", height: "1em" }} />
              </IconButton>
            );
          })}
        </Flex>

        <Flex
          overflow="hidden"
          style={{ borderRadius: "var(--radius-full)" }}
          direction="column"
        >
          <IconButton
            size={size}
            variant={tankFilters.gunType.includes("regular") ? "solid" : "soft"}
            radius="none"
            color={tankFilters.gunType.includes("regular") ? undefined : "gray"}
            highContrast
            onClick={() => {
              TankFilters.mutate((draft) => {
                if (tankFilters.gunType.includes("regular")) {
                  draft.gunType = draft.gunType.filter((t) => t !== "regular");
                } else {
                  draft.gunType = [...draft.gunType, "regular"];
                }
              });
            }}
          >
            <GunRegularIcon style={{ width: "1em", height: "1em" }} />
          </IconButton>
          <IconButton
            size={size}
            variant={
              tankFilters.gunType.includes("auto_loader") ? "solid" : "soft"
            }
            radius="none"
            color={
              tankFilters.gunType.includes("auto_loader") ? undefined : "gray"
            }
            highContrast
            onClick={() => {
              TankFilters.mutate((draft) => {
                if (tankFilters.gunType.includes("auto_loader")) {
                  draft.gunType = draft.gunType.filter(
                    (t) => t !== "auto_loader"
                  );
                } else {
                  draft.gunType = [...draft.gunType, "auto_loader"];
                }
              });
            }}
          >
            <GunAutoloaderIcon style={{ width: "1em", height: "1em" }} />
          </IconButton>
          <IconButton
            size={size}
            variant={
              tankFilters.gunType.includes("auto_reloader") ? "solid" : "soft"
            }
            radius="none"
            color={
              tankFilters.gunType.includes("auto_reloader") ? undefined : "gray"
            }
            highContrast
            onClick={() => {
              TankFilters.mutate((draft) => {
                if (tankFilters.gunType.includes("auto_reloader")) {
                  draft.gunType = draft.gunType.filter(
                    (t) => t !== "auto_reloader"
                  );
                } else {
                  draft.gunType = [...draft.gunType, "auto_reloader"];
                }
              });
            }}
          >
            <GunAutoreloaderIcon style={{ width: "1em", height: "1em" }} />
          </IconButton>
        </Flex>

        <Flex
          overflow="hidden"
          style={{ borderRadius: "var(--radius-full)" }}
          direction="column"
        >
          <ShellFilter index={0} />
          <ShellFilter index={1} premium />
          <ShellFilter index={2} />
        </Flex>

        <Flex
          overflow="hidden"
          style={{ borderRadius: "var(--radius-full)" }}
          direction="column"
        >
          <IconButton
            size={size}
            variant={
              tankFilters.types?.includes(TankType.RESEARCHABLE)
                ? "solid"
                : "soft"
            }
            radius="none"
            color={
              tankFilters.types?.includes(TankType.RESEARCHABLE)
                ? undefined
                : "gray"
            }
            highContrast
            onClick={() => {
              TankFilters.mutate((draft) => {
                if (tankFilters.types.includes(TankType.RESEARCHABLE)) {
                  draft.types = draft.types.filter(
                    (t) => t !== TankType.RESEARCHABLE
                  );
                } else {
                  draft.types = [...draft.types, TankType.RESEARCHABLE];
                }
              });
            }}
          >
            <ResearchedIcon style={{ width: "1em", height: "1em" }} />
          </IconButton>
          <IconButton
            size={size}
            variant={
              tankFilters.types?.includes(TankType.PREMIUM) ? "solid" : "soft"
            }
            radius="none"
            color={
              tankFilters.types?.includes(TankType.PREMIUM) ? "amber" : "gray"
            }
            highContrast
            onClick={() => {
              TankFilters.mutate((draft) => {
                if (tankFilters.types.includes(TankType.PREMIUM)) {
                  draft.types = draft.types.filter(
                    (t) => t !== TankType.PREMIUM
                  );
                } else {
                  draft.types = [...draft.types, TankType.PREMIUM];
                }
              });
            }}
          >
            <Text
              color={
                tankFilters.types?.includes(TankType.PREMIUM)
                  ? undefined
                  : "amber"
              }
              style={{ display: "flex", justifyContent: "center" }}
            >
              <ResearchedIcon style={{ width: "1em", height: "1em" }} />
            </Text>
          </IconButton>
          <IconButton
            size={size}
            variant={
              tankFilters.types?.includes(TankType.COLLECTOR) ? "solid" : "soft"
            }
            radius="none"
            color={
              tankFilters.types?.includes(TankType.COLLECTOR) ? "blue" : "gray"
            }
            highContrast
            onClick={() => {
              TankFilters.mutate((draft) => {
                if (tankFilters.types.includes(TankType.COLLECTOR)) {
                  draft.types = draft.types.filter(
                    (t) => t !== TankType.COLLECTOR
                  );
                } else {
                  draft.types = [...draft.types, TankType.COLLECTOR];
                }
              });
            }}
          >
            <Text
              color={
                tankFilters.types?.includes(TankType.COLLECTOR)
                  ? undefined
                  : "blue"
              }
              style={{ display: "flex", justifyContent: "center" }}
            >
              <ResearchedIcon style={{ width: "1em", height: "1em" }} />
            </Text>
          </IconButton>
        </Flex>

        <Flex
          overflow="hidden"
          style={{ borderRadius: "var(--radius-full)" }}
          direction="column"
        >
          <IconButton
            size={size}
            variant={tankFilters.showNonTesting ? "solid" : "soft"}
            radius="none"
            color={tankFilters.showNonTesting ? undefined : "gray"}
            highContrast
            onClick={() => {
              TankFilters.mutate((draft) => {
                draft.showNonTesting = !draft.showNonTesting;
              });
            }}
          >
            <ScienceOffIcon
              style={{ width: "1em", height: "1em", color: "currentColor" }}
            />
          </IconButton>

          <IconButton
            size={size}
            variant={tankFilters.showTesting ? "solid" : "soft"}
            radius="none"
            color={tankFilters.showTesting ? undefined : "gray"}
            highContrast
            onClick={() => {
              TankFilters.mutate((draft) => {
                draft.showTesting = !draft.showTesting;
              });
            }}
          >
            <ScienceIcon
              style={{ width: "1em", height: "1em", color: "currentColor" }}
            />
          </IconButton>
        </Flex>

        {wargaming ? (
          <OwnershipFilter />
        ) : (
          <Tooltip content={strings.website.common.tank_search.login}>
            <OwnershipFilter />
          </Tooltip>
        )}
      </Flex>

      {clearable && (
        <Link
          color="red"
          underline="always"
          mt="4"
          href="#"
          onClick={(event) => {
            event.preventDefault();
            TankFilters.set(TankFilters.initial);
            TankSort.set(TankSort.initial);
          }}
        >
          {strings.website.common.tank_search.clear_filters}
        </Link>
      )}
    </Flex>
  );
}
