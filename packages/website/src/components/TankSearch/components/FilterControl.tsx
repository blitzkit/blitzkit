import { asset, ShellType, TIER_ROMAN_NUMERALS } from "@blitzkit/core";
import { TrashIcon } from "@radix-ui/react-icons";
import { Box, Button, DropdownMenu, Flex, Text } from "@radix-ui/themes";
import { isEqual, times } from "lodash-es";
import { awaitableGameDefinitions } from "../../../core/awaitables/gameDefinitions";
import { useLocale } from "../../../hooks/useLocale";
import { App } from "../../../stores/app";
import { TankFilters } from "../../../stores/tankFilters";

const gameDefinitions = await awaitableGameDefinitions;

const shellTypeIcons: Record<ShellType, string> = {
  [ShellType.AP]: "ap",
  [ShellType.APCR]: "ap_cr",
  [ShellType.HE]: "he",
  [ShellType.HEAT]: "hc",
};

const MAX_NATIONS = 3;
const MAX_TIERS = 2;
const TIERS = times(10, (i) => i + 1);

export function FilterControl() {
  const tankFilters = TankFilters.use();
  const { strings } = useLocale();
  const clearable = !isEqual(tankFilters, TankFilters.initial);
  const wargaming = App.use((state) => state.logins.wargaming);

  const tiers = tankFilters.tiers.length === 0 ? TIERS : tankFilters.tiers;
  const nations =
    tankFilters.nations.length === 0
      ? gameDefinitions.nations
      : tankFilters.nations;

  return (
    <Flex align="center" gap="2">
      <DropdownMenu.Root>
        <DropdownMenu.Trigger>
          <Button color="gray" variant="surface">
            Tiers
            <Flex gap="1">
              {tiers
                .sort((a, b) => b - a)
                .slice(0, MAX_TIERS)
                .map((tier, index) => (
                  // <img
                  //   style={{
                  //     marginLeft: index > 0 ? "-0.5em" : undefined,
                  //     width: "1.25em",
                  //     height: "1.25em",
                  //   }}
                  //   src={asset(`flags/circle/${nation}.webp`)}
                  // />
                  <Text size="1" key={tier}>
                    {TIER_ROMAN_NUMERALS[tier]}
                  </Text>
                ))}

              {nations.length > MAX_TIERS && (
                <Text size="1">+{nations.length - MAX_TIERS}</Text>
              )}
            </Flex>
          </Button>
        </DropdownMenu.Trigger>

        <DropdownMenu.Content>
          {TIERS.map((tier) => {
            const selected = tankFilters.tiers.includes(tier);

            return (
              <DropdownMenu.CheckboxItem
                onClick={(event) => {
                  event.preventDefault();

                  TankFilters.mutate((draft) => {
                    if (selected) {
                      draft.tiers = draft.tiers.filter((t) => t !== tier);
                    } else {
                      draft.tiers = [...draft.tiers, tier];
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

      <DropdownMenu.Root>
        <DropdownMenu.Trigger>
          <Button color="gray" variant="surface">
            Nations
            <Flex>
              {nations.slice(0, MAX_NATIONS).map((nation, index) => (
                <img
                  style={{
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
            const selected = tankFilters.nations.includes(nation);

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
    </Flex>
  );
}
