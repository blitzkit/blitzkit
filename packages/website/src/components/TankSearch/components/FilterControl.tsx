import {
  asset,
  ShellType,
  TANK_CLASSES,
  TIER_ROMAN_NUMERALS,
} from "@blitzkit/core";
import { TrashIcon } from "@radix-ui/react-icons";
import { Box, Button, DropdownMenu, Flex, Text } from "@radix-ui/themes";
import { times } from "lodash-es";
import { awaitableGameDefinitions } from "../../../core/awaitables/gameDefinitions";
import { useLocale } from "../../../hooks/useLocale";
import { TankFilters } from "../../../stores/tankFilters";
import { classIcons } from "../../ClassIcon";

const gameDefinitions = await awaitableGameDefinitions;

const shellTypeIcons: Record<ShellType, string> = {
  [ShellType.AP]: "ap",
  [ShellType.APCR]: "ap_cr",
  [ShellType.HE]: "he",
  [ShellType.HEAT]: "hc",
};

const MAX_NATIONS = 3;
const MAX_TIERS = 2;

const TIERS = times(10, (i) => 10 - i);

export function FilterControl() {
  return (
    <Flex align="center" gap="2">
      <TiersFilter />
      <NationsFilter />
      <ClassFilter />
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
          Tiers
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
          Nations
          <Flex>
            {nations.slice(0, MAX_NATIONS).map((nation, index) => (
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

            {nations.length > MAX_NATIONS && (
              <Text size="1" ml="1">
                +{nations.length - MAX_NATIONS}
              </Text>
            )}
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
          Classes
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
