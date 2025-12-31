import {
  asset,
  GunDefinition,
  ShellType,
  TANK_CLASSES,
  TANK_TYPES,
  TankType,
  TIER_ROMAN_NUMERALS,
} from "@blitzkit/core";
import locales from "@blitzkit/i18n/locales.json";
import {
  LockClosedIcon,
  LockOpen2Icon,
  TrashIcon,
} from "@radix-ui/react-icons";
import {
  Box,
  Button,
  DropdownMenu,
  Flex,
  IconButton,
  Text,
  Tooltip,
  type FlexProps,
} from "@radix-ui/themes";
import { times } from "lodash-es";
import type { ComponentProps, ReactNode } from "react";
import { awaitableConsumableDefinitions } from "../../../core/awaitables/consumableDefinitions";
import { awaitableGameDefinitions } from "../../../core/awaitables/gameDefinitions";
import { useLocale } from "../../../hooks/useLocale";
import { App } from "../../../stores/app";
import { TankFilters, type CaseType } from "../../../stores/tankFilters";
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

const consumablesArray = Object.values(consumableDefinitions.consumables)
  .filter(
    (consumable) =>
      !consumable.game_mode_exclusive &&
      consumable.name.locales[locales.default]
  )
  .map((consumable) => consumable.id);
const abilitiesArray = Object.values(consumableDefinitions.consumables)
  .filter((consumable) => consumable.game_mode_exclusive)
  .map((consumable) => consumable.id);

const shellTypeIcons: Record<ShellType, string> = {
  [ShellType.AP]: "ap",
  [ShellType.APCR]: "ap_cr",
  [ShellType.HE]: "he",
  [ShellType.HEAT]: "hc",
};

const GUN_TYPE_ICONS: Record<
  CaseType<GunDefinition>,
  (props: ComponentProps<"svg">) => ReactNode
> = {
  regular: GunRegularIcon,
  auto_loader: GunAutoloaderIcon,
  auto_reloader: GunAutoreloaderIcon,
};

const TANK_TYPE_COLORS: Record<TankType, string> = {
  [TankType.RESEARCHABLE]: "gray",
  [TankType.PREMIUM]: "amber",
  [TankType.COLLECTOR]: "blue",
};

const GUN_TYPES = Object.keys(
  GUN_TYPE_ICONS
) as (keyof typeof GUN_TYPE_ICONS)[];

const MAX_TIERS = 4;
const MAX_CONSUMABLES = 4;

const TIERS = times(10, (i) => 10 - i);

export function FilterControl() {
  return (
    <Flex align="center" gap="2" wrap="wrap">
      <TiersFilter />
      <NationsFilter />
      <TypeFilter />
      <ClassFilter />

      <OwnershipFilter />
      <TestFilter />

      <GunTypeFilter />
      <ShellFilter />
      <ConsumablesFilter />
    </Flex>
  );
}

function TiersFilter() {
  const tiersRaw = TankFilters.use((state) => state.tiers);
  const tiers = tiersRaw.length === 0 ? TIERS : tiersRaw;

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger>
        <Button color="gray" variant="surface">
          <Flex gap="1">
            {tiers.slice(0, MAX_TIERS).map((tier) => (
              <Text size="1" key={tier}>
                {TIER_ROMAN_NUMERALS[tier]}
              </Text>
            ))}

            {tiers.length > MAX_TIERS && (
              <Text size="1">+{tiers.length - MAX_TIERS}</Text>
            )}
          </Flex>
        </Button>
      </DropdownMenu.Trigger>

      <DropdownMenu.Content>
        {TIERS.map((tier) => {
          const selected = tiersRaw.includes(tier);

          return (
            <DropdownMenu.CheckboxItem
              onClick={(event) => {
                event.preventDefault();

                TankFilters.mutate((draft) => {
                  if (selected) {
                    draft.tiers = draft.tiers.filter((t) => t !== tier);
                  } else {
                    draft.tiers = [...draft.tiers, tier].sort((a, b) => b - a);
                  }
                });
              }}
              checked={selected}
              key={tier}
            >
              Tier {TIER_ROMAN_NUMERALS[tier]}
            </DropdownMenu.CheckboxItem>
          );
        })}

        <DropdownMenu.Separator />

        <DropdownMenu.Item
          color="red"
          onClick={(event) => {
            event.preventDefault();

            TankFilters.mutate((draft) => {
              draft.tiers = [];
            });
          }}
        >
          <TrashIcon />
          Clear
        </DropdownMenu.Item>
      </DropdownMenu.Content>
    </DropdownMenu.Root>
  );
}

function NationsFilter() {
  const rawNations = TankFilters.use((state) => state.nations);
  const nations =
    rawNations.length === 0 ? gameDefinitions.nations : rawNations;
  const { strings } = useLocale();

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger>
        <Button color="gray" variant="surface">
          <Flex>
            {nations.map((nation, index) => (
              <img
                style={{
                  filter: "drop-shadow(0 0 var(--space-1) var(--black-a11))",
                  marginLeft: index > 0 ? "-0.5em" : undefined,
                  width: "1.25em",
                  height: "1.25em",
                }}
                src={asset(`flags/circle/${nation}.webp`)}
              />
            ))}
          </Flex>
        </Button>
      </DropdownMenu.Trigger>

      <DropdownMenu.Content>
        {gameDefinitions.nations.map((nation) => {
          const selected = rawNations.includes(nation);

          return (
            <DropdownMenu.CheckboxItem
              onClick={(event) => {
                event.preventDefault();

                TankFilters.mutate((draft) => {
                  if (selected) {
                    draft.nations = draft.nations.filter((n) => n !== nation);
                  } else {
                    draft.nations = [...draft.nations, nation];
                  }
                });
              }}
              checked={selected}
              key={nation}
              style={{
                position: "relative",
              }}
            >
              <Box
                width="calc(100% + calc(4 * var(--space-2)))"
                height="100%"
                position="absolute"
                right="0"
                mr="-2"
                style={{
                  backgroundImage: `url(${asset(
                    `flags/scratched/${nation}.webp`
                  )})`,
                  backgroundSize: "100%",
                  backgroundRepeat: "no-repeat",
                  backgroundPosition: "5rem center",
                }}
              >
                <Box
                  width="100%"
                  height="100%"
                  style={{
                    background: `linear-gradient(90deg, var(--gray-2) 50%, transparent)`,
                  }}
                />
              </Box>

              <Text style={{ zIndex: 1 }}>
                {
                  strings.common.nations[
                    nation as keyof typeof strings.common.nations
                  ]
                }
              </Text>
            </DropdownMenu.CheckboxItem>
          );
        })}

        <DropdownMenu.Separator />

        <DropdownMenu.Item
          color="red"
          onClick={(event) => {
            event.preventDefault();

            TankFilters.mutate((draft) => {
              draft.nations = [];
            });
          }}
        >
          <TrashIcon />
          Clear
        </DropdownMenu.Item>
      </DropdownMenu.Content>
    </DropdownMenu.Root>
  );
}

function ClassFilter() {
  const { strings } = useLocale();
  const rawClasses = TankFilters.use((state) => state.classes);
  const classes = rawClasses.length === 0 ? TANK_CLASSES : rawClasses;

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger>
        <Button color="gray" variant="surface">
          <Flex>
            {classes.map((tankClass, index) => {
              const Icon = classIcons[tankClass];
              return (
                <Icon
                  style={{
                    color: "var(--gray-12)",
                    opacity: 1,
                    filter: "drop-shadow(0 0 var(--space-1) var(--black-a11))",
                    marginLeft: index > 0 ? "-0.5em" : undefined,
                    width: "1.25em",
                    height: "1.25em",
                  }}
                  key={tankClass}
                />
              );
            })}
          </Flex>
        </Button>
      </DropdownMenu.Trigger>

      <DropdownMenu.Content>
        {TANK_CLASSES.map((tankClass) => {
          const selected = rawClasses.includes(tankClass);
          const Icon = classIcons[tankClass];

          return (
            <DropdownMenu.CheckboxItem
              onClick={(event) => {
                event.preventDefault();

                TankFilters.mutate((draft) => {
                  if (selected) {
                    draft.classes = draft.classes.filter(
                      (c) => c !== tankClass
                    );
                  } else {
                    draft.classes = [...draft.classes, tankClass];
                  }
                });
              }}
              checked={selected}
              key={tankClass}
            >
              <Icon style={{ width: "1em", height: "1em" }} />

              {strings.common.tank_class_medium[tankClass]}
            </DropdownMenu.CheckboxItem>
          );
        })}

        <DropdownMenu.Separator />

        <DropdownMenu.Item
          color="red"
          onClick={(event) => {
            event.preventDefault();

            TankFilters.mutate((draft) => {
              draft.classes = [];
            });
          }}
        >
          <TrashIcon />
          Clear
        </DropdownMenu.Item>
      </DropdownMenu.Content>
    </DropdownMenu.Root>
  );
}

function GunTypeFilter() {
  const rawGunTypes = TankFilters.use((state) => state.gunType);
  const gunTypes = rawGunTypes.length === 0 ? GUN_TYPES : rawGunTypes;
  const { strings } = useLocale();

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger>
        <Button color="gray" variant="surface">
          <Flex>
            {gunTypes.map((gunType) => {
              const Icon = GUN_TYPE_ICONS[gunType];

              return (
                <Icon
                  style={{
                    margin: gunType === "regular" ? "0 -0.125em" : undefined,
                    opacity: 1,
                    color: "var(--gray-12)",
                    width: "1.25em",
                    height: "1.25em",
                  }}
                  key={gunType}
                />
              );
            })}
          </Flex>
        </Button>
      </DropdownMenu.Trigger>

      <DropdownMenu.Content>
        {GUN_TYPES.map((gunType) => {
          const selected = rawGunTypes.includes(gunType);
          const Icon = GUN_TYPE_ICONS[gunType];

          return (
            <DropdownMenu.CheckboxItem
              onClick={(event) => {
                event.preventDefault();

                TankFilters.mutate((draft) => {
                  if (selected) {
                    draft.gunType = draft.gunType.filter((c) => c !== gunType);
                  } else {
                    draft.gunType = [...draft.gunType, gunType];
                  }
                });
              }}
              checked={selected}
              key={gunType}
            >
              <Icon style={{ width: "1em", height: "1em" }} />

              {strings.common.gun_types[gunType]}
            </DropdownMenu.CheckboxItem>
          );
        })}

        <DropdownMenu.Separator />

        <DropdownMenu.Item
          color="red"
          onClick={(event) => {
            event.preventDefault();

            TankFilters.mutate((draft) => {
              draft.gunType = [];
            });
          }}
        >
          <TrashIcon />
          Clear
        </DropdownMenu.Item>
      </DropdownMenu.Content>
    </DropdownMenu.Root>
  );
}

function TypeFilter() {
  const { strings } = useLocale();
  const rawTypes = TankFilters.use((state) => state.types);
  const types = rawTypes.length === 0 ? TANK_TYPES : rawTypes;

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger>
        <Button color="gray" variant="surface">
          <Flex gap="1">
            {types.map((tankType, index) => {
              return (
                <ResearchedIcon
                  style={{
                    color: `var(--${TANK_TYPE_COLORS[tankType]}-${
                      tankType === TankType.RESEARCHABLE ? "12" : "11"
                    })`,
                    filter: "drop-shadow(0 0 var(--space-1) var(--black-a11))",
                    opacity: 1,
                    width: "1.25em",
                    height: "1.25em",
                  }}
                  key={tankType}
                />
              );
            })}
          </Flex>
        </Button>
      </DropdownMenu.Trigger>

      <DropdownMenu.Content>
        {TANK_TYPES.map((tankType) => {
          const selected = rawTypes.includes(tankType);

          return (
            <DropdownMenu.CheckboxItem
              onClick={(event) => {
                event.preventDefault();

                TankFilters.mutate((draft) => {
                  if (selected) {
                    draft.types = draft.types.filter((c) => c !== tankType);
                  } else {
                    draft.types = [...draft.types, tankType];
                  }
                });
              }}
              checked={selected}
              key={tankType}
            >
              <ResearchedIcon
                style={{
                  color: `var(--${TANK_TYPE_COLORS[tankType]}-${
                    tankType === TankType.RESEARCHABLE ? "12" : "11"
                  })`,
                  opacity: 1,
                  width: "1em",
                  height: "1em",
                }}
              />

              {strings.common.tree_type[tankType]}
            </DropdownMenu.CheckboxItem>
          );
        })}

        <DropdownMenu.Separator />

        <DropdownMenu.Item
          color="red"
          onClick={(event) => {
            event.preventDefault();

            TankFilters.mutate((draft) => {
              draft.types = [];
            });
          }}
        >
          <TrashIcon />
          Clear
        </DropdownMenu.Item>
      </DropdownMenu.Content>
    </DropdownMenu.Root>
  );
}

function ShellFilter() {
  return (
    <Flex style={{}}>
      <IndividualShellFilter index={0} />
      <IndividualShellFilter index={1} premium />
      <IndividualShellFilter index={2} />
    </Flex>
  );
}

function IndividualShellFilter({
  index,
  premium,
}: {
  index: number;
  premium?: boolean;
}) {
  const { strings } = useLocale();
  const shells = TankFilters.use((state) => state.shells);

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger>
        <IconButton
          ml="-0.5px"
          variant="surface"
          style={{
            borderTopLeftRadius: index === 0 ? undefined : 0,
            borderBottomLeftRadius: index === 0 ? undefined : 0,
            borderTopRightRadius: index === 2 ? undefined : 0,
            borderBottomRightRadius: index === 2 ? undefined : 0,
          }}
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
      </DropdownMenu.Trigger>

      <DropdownMenu.Content>
        <DropdownMenu.RadioGroup value={`${shells[index]}`}>
          {Object.values(ShellType).map((shellType) => {
            if (typeof shellType === "string") return null;

            const selected = shells[index] === shellType;

            return (
              <DropdownMenu.RadioItem
                key={shellType}
                value={`${shellType}`}
                onClick={() => {
                  const mutated = [...shells] as TankFilters["shells"];

                  mutated[index] = selected ? null : shellType;

                  TankFilters.mutate((draft) => {
                    draft.shells = mutated;
                  });
                }}
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

                {
                  strings.common.shells[
                    shellTypeIcons[
                      shellType
                    ] as keyof typeof strings.common.shells
                  ]
                }
              </DropdownMenu.RadioItem>
            );
          })}
        </DropdownMenu.RadioGroup>
      </DropdownMenu.Content>
    </DropdownMenu.Root>
  );
}

function OwnershipFilter() {
  const wargaming = App.use((state) => state.logins.wargaming);
  const { strings } = useLocale();

  return wargaming ? (
    <OwnershipFilterInternal />
  ) : (
    <Tooltip content={strings.website.common.tank_search.login}>
      <OwnershipFilterInternal />
    </Tooltip>
  );
}

function OwnershipFilterInternal(props: FlexProps) {
  const wargaming = App.use((state) => state.logins.wargaming);
  const showOwned = TankFilters.use((state) => state.showOwned);
  const showUnowned = TankFilters.use((state) => state.showUnowned);

  return (
    <Flex {...props}>
      <IconButton
        style={{
          borderTopRightRadius: 0,
          borderBottomRightRadius: 0,
        }}
        disabled={!wargaming}
        variant={showOwned ? "solid" : "surface"}
        color={showOwned ? undefined : "gray"}
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
        style={{
          borderTopLeftRadius: 0,
          borderBottomLeftRadius: 0,
          marginLeft: "-1px",
        }}
        disabled={!wargaming}
        variant={showUnowned ? "solid" : "surface"}
        color={showUnowned ? undefined : "gray"}
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

function TestFilter() {
  const showTesting = TankFilters.use((state) => state.showTesting);
  const showNonTesting = TankFilters.use((state) => state.showNonTesting);

  return (
    <Flex>
      <IconButton
        style={{
          borderTopRightRadius: 0,
          borderBottomRightRadius: 0,
        }}
        variant={showNonTesting ? "solid" : "surface"}
        color={showNonTesting ? undefined : "gray"}
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
        style={{
          borderTopLeftRadius: 0,
          borderBottomLeftRadius: 0,
          marginLeft: "-1px",
        }}
        variant={showTesting ? "solid" : "surface"}
        color={showTesting ? undefined : "gray"}
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
  );
}

function ConsumablesFilter() {
  const rawConsumables = TankFilters.use((state) => state.consumables);
  const consumables =
    rawConsumables.length === 0 ? consumablesArray : rawConsumables;
  const { unwrap } = useLocale();

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger>
        <Button color="gray" variant="surface">
          <Flex>
            {consumables.slice(0, MAX_CONSUMABLES).map((consumable, index) => (
              <img
                style={{
                  filter: "drop-shadow(0 0 var(--space-1) var(--black-a11))",
                  marginLeft: index > 0 ? "-0.5em" : undefined,
                  width: "1.25em",
                  height: "1.25em",
                  objectFit: "contain",
                }}
                src={asset(`icons/consumables/${consumable}.webp`)}
              />
            ))}

            {consumables.length > MAX_CONSUMABLES && (
              <Text size="1" ml="1">
                +{consumables.length - MAX_CONSUMABLES}
              </Text>
            )}
          </Flex>
        </Button>
      </DropdownMenu.Trigger>

      <DropdownMenu.Content>
        {consumablesArray.map((consumable) => {
          const selected = rawConsumables.includes(consumable);
          const consumableDefinition =
            consumableDefinitions.consumables[consumable];

          return (
            <DropdownMenu.CheckboxItem
              onClick={(event) => {
                event.preventDefault();

                TankFilters.mutate((draft) => {
                  if (selected) {
                    draft.consumables = draft.consumables.filter(
                      (n) => n !== consumable
                    );
                  } else {
                    draft.consumables = [...draft.consumables, consumable];
                  }
                });
              }}
              checked={selected}
              key={consumable}
            >
              <img
                style={{
                  width: "1em",
                  height: "1em",
                  objectFit: "contain",
                }}
                src={asset(`icons/consumables/${consumable}.webp`)}
              />

              {unwrap(consumableDefinition.name)}
            </DropdownMenu.CheckboxItem>
          );
        })}

        <DropdownMenu.Separator />

        <DropdownMenu.Item
          color="red"
          onClick={(event) => {
            event.preventDefault();

            TankFilters.mutate((draft) => {
              draft.consumables = [];
            });
          }}
        >
          <TrashIcon />
          Clear
        </DropdownMenu.Item>
      </DropdownMenu.Content>
    </DropdownMenu.Root>
  );
}
