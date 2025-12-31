import { asset, ShellType } from "@blitzkit/core";
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
  Inset,
  Popover,
  Text,
  type FlexProps,
} from "@radix-ui/themes";
import { isEqual } from "lodash-es";
import { awaitableGameDefinitions } from "../../../core/awaitables/gameDefinitions";
import { useLocale } from "../../../hooks/useLocale";
import { App } from "../../../stores/app";
import { TankFilters } from "../../../stores/tankFilters";
import { MissingShellIcon } from "../../MissingShellIcon";

const gameDefinitions = await awaitableGameDefinitions;

const shellTypeIcons: Record<ShellType, string> = {
  [ShellType.AP]: "ap",
  [ShellType.APCR]: "ap_cr",
  [ShellType.HE]: "he",
  [ShellType.HEAT]: "hc",
};

const MAX_NATIONS = 3;

function ShellFilter({ index, premium }: { index: number; premium?: boolean }) {
  const shells = TankFilters.use((state) => state.shells);

  return (
    <Popover.Root>
      <Popover.Trigger>
        <IconButton variant="soft" radius="none" color="gray" highContrast>
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

  const nations =
    tankFilters.nations.length === 0
      ? gameDefinitions.nations
      : tankFilters.nations;

  return (
    <Flex align="center" gap="2">
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
