import {
  type AccountListWithServer,
  type CompositeStatsKey,
  type IndividualAccountInfo,
  type IndividualTankStats,
  compositeStats,
  compositeStatsKeys,
  deltaTankStats,
  formatCompositeStat,
  getAccountInfo,
  getTankStats,
  idToRegion,
  searchPlayersAcrossRegions,
  sumCompositeStats,
} from "@blitzkit/core";
import { literals } from "@blitzkit/i18n";
import {
  ArrowDownIcon,
  MagnifyingGlassIcon,
  PlusIcon,
} from "@radix-ui/react-icons";
import {
  AlertDialog,
  Button,
  DropdownMenu,
  Flex,
  Heading,
  IconButton,
  Select,
  Table,
  Text,
  TextField,
} from "@radix-ui/themes";
import { debounce } from "lodash-es";
import { useEffect, useMemo, useRef, useState } from "react";
import { PageWrapper } from "../../../components/PageWrapper";
import { StickyRowHeaderCell } from "../../../components/StickyRowHeaderCell";
import { StickyTableRoot } from "../../../components/StickyTableRoot";
import { TankRowHeaderCell } from "../../../components/TankRowHeaderCell";
import { awaitableAverageDefinitions } from "../../../core/awaitables/averageDefinitions";
import { awaitableTankDefinitions } from "../../../core/awaitables/tankDefinitions";
import {
  type LocaleAcceptorProps,
  LocaleProvider,
  useLocale,
} from "../../../hooks/useLocale";
import { Session, type SessionTracking } from "../../../stores/session";

const [tankDefinitions, averageDefinitions] = await Promise.all([
  awaitableTankDefinitions,
  awaitableAverageDefinitions,
]);

export function Page({ locale }: LocaleAcceptorProps) {
  return (
    <LocaleProvider locale={locale}>
      <Content />
    </LocaleProvider>
  );
}

function Content() {
  const { locale, strings } = useLocale();
  const [showSearch, setShowSearch] = useState(false);
  const [searching, setSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<AccountListWithServer>([]);
  const [showCCInaccessibilityPrompt, setShowCCInaccessibilityPrompt] =
    useState(false);
  const input = useRef<HTMLInputElement>(null);
  const session = Session.use();
  const [tankStatsB, setTankStatsB] = useState<IndividualTankStats[] | null>(
    null
  );
  const [accountInfo, setAccountInfo] = useState<
    IndividualAccountInfo | null | undefined
  >(undefined);

  useEffect(() => {
    (async () => {
      const id = session.tracking ? session.player.id : undefined;
      if (!id) return setAccountInfo(null);

      setAccountInfo(
        session.tracking ? await getAccountInfo(idToRegion(id), id) : null
      );
    })();
  }, [session.tracking && session.player.id]);
  const delta = useMemo(
    () =>
      session.tracking && tankStatsB
        ? deltaTankStats(session.player.stats, tankStatsB)
            .sort((a, b) => b.last_battle_time - a.last_battle_time)
            .map((entry) => {
              const tank = tankDefinitions.tanks[entry.tank_id];
              const average = averageDefinitions.averages[tank.id];
              const composite = compositeStats(
                { ...entry.all, battle_life_time: entry.battle_life_time },
                average?.mu
              );

              return { tank, composite };
            })
        : undefined,
    [session.tracking && session.player, tankStatsB]
  );
  const total = useMemo(
    () =>
      delta
        ? sumCompositeStats(delta.map(({ composite }) => composite))
        : undefined,
    [delta]
  );
  const search = debounce(async () => {
    if (!input.current) return;

    setSearchResults(await searchPlayersAcrossRegions(input.current.value, 15));
    setSearching(false);
  }, 500);

  async function track(id: number) {
    const region = idToRegion(id);
    const player = await getAccountInfo(region, id);
    const stats = await getTankStats(region, id);

    if (stats === null) {
      setShowCCInaccessibilityPrompt(true);
      return;
    }

    setShowSearch(false);

    Session.mutate((draft) => {
      if (!input.current) return;

      draft.tracking = true;
      (draft as SessionTracking).player = {
        id,
        region,
        since: Date.now(),
        stats,
      };

      input.current.value = player.nickname;
    });
  }

  useEffect(() => {
    async function update() {
      if (!session.tracking) return;

      const tankStats = await getTankStats(
        idToRegion(session.player.id),
        session.player.id
      );
      setTankStatsB(tankStats);
    }

    update();
    const interval = setInterval(update, 5 * 1000);

    return () => clearInterval(interval);
  }, [session.tracking && session.player.id]);

  return (
    <PageWrapper color="blue">
      <AlertDialog.Root
        open={showCCInaccessibilityPrompt}
        onOpenChange={setShowCCInaccessibilityPrompt}
      >
        <AlertDialog.Content>
          <AlertDialog.Title>
            {strings.website.tools.session.no_cc.title}
          </AlertDialog.Title>
          <AlertDialog.Description>
            {strings.website.tools.session.no_cc.body}
          </AlertDialog.Description>

          <Flex mt="4" justify="end">
            <AlertDialog.Action>
              <Button variant="solid">
                {strings.website.tools.session.no_cc.alright}
              </Button>
            </AlertDialog.Action>
          </Flex>
        </AlertDialog.Content>
      </AlertDialog.Root>

      {!session.tracking && (
        <Flex
          style={{ flex: 1 }}
          align="center"
          justify="center"
          direction="column"
          gap="3"
        >
          <Flex gap="2" align="center">
            <Text color="gray">
              {strings.website.tools.session.search.lookup}
            </Text>
            <ArrowDownIcon />
          </Flex>

          <TextField.Root
            variant="classic"
            size="3"
            style={{
              position: "relative",
              width: "75vw",
              maxWidth: 480,
            }}
            ref={input}
            placeholder={strings.website.tools.session.search.hint}
            onChange={() => {
              if (!input.current) return;

              const sanitized = input.current.value.trim();

              if (sanitized.length > 0) {
                setShowSearch(true);
                setSearching(true);
                search();
              } else {
                setShowSearch(false);
              }
            }}
          >
            <TextField.Slot>
              <MagnifyingGlassIcon />
            </TextField.Slot>
          </TextField.Root>

          {showSearch && (
            <Flex mt="2">
              {searching && (
                <Flex justify="center">
                  <Text color="gray">
                    {strings.website.tools.session.search.searching}
                  </Text>
                </Flex>
              )}

              {!searching && searchResults.length === 0 && (
                <Flex justify="center">
                  <Text color="gray">
                    {strings.website.tools.session.search.no_results}
                  </Text>
                </Flex>
              )}

              {!searching && searchResults.length > 0 && (
                <Flex direction="column" gap="2">
                  {searchResults.map((player) => (
                    <Button
                      key={player.account_id}
                      variant="ghost"
                      onClick={() => track(player.account_id)}
                    >
                      {player.nickname} (
                      {strings.common.regions.short[player.region]})
                    </Button>
                  ))}
                </Flex>
              )}
            </Flex>
          )}
        </Flex>
      )}

      {session.tracking && (
        <Flex
          mt="2"
          mb="2"
          direction={{ initial: "column", sm: "row" }}
          align="center"
          justify="between"
          gap="2"
        >
          <Flex mt="2" mb="2" direction="column" gap="2">
            <Heading size="5">
              {literals(strings.website.tools.session.controls.title, [
                `${accountInfo?.nickname}`,
              ])}
            </Heading>
            <Text color="gray">
              {literals(strings.website.tools.session.controls.subtitle, [
                new Date(session.player.since).toLocaleString(locale),
              ])}
            </Text>
          </Flex>

          <Flex gap="2" align="center" justify="center">
            <Button
              color="red"
              onClick={async () => {
                const stats = await getTankStats(
                  session.player.region,
                  session.player.id
                );

                if (stats === null) {
                  setShowCCInaccessibilityPrompt(true);
                  return;
                }

                Session.mutate((draft) => {
                  (draft as SessionTracking).player.stats = stats;
                });
              }}
            >
              {strings.website.tools.session.controls.reset}
            </Button>
            <Button
              onClick={() => {
                Session.mutate((draft) => {
                  draft.tracking = false;
                });
              }}
            >
              {strings.website.tools.session.controls.change}
            </Button>
          </Flex>
        </Flex>
      )}

      {session.tracking && delta && delta.length > 0 && (
        <Flex justify="center">
          <StickyTableRoot variant="surface">
            <Table.Header>
              <Table.Row>
                <Table.ColumnHeaderCell>
                  {strings.website.tools.session.table.tank}
                </Table.ColumnHeaderCell>

                {session.columns.map((column, index) => (
                  <Table.ColumnHeaderCell
                    align="center"
                    width="0"
                    key={column}
                    style={{ position: "relative" }}
                  >
                    {index === 0 && session.columns.length < 4 && (
                      <DropdownMenu.Root>
                        <DropdownMenu.Trigger>
                          <IconButton
                            size="1"
                            variant="surface"
                            style={{
                              position: "absolute",
                              left: 0,
                              top: "50%",
                              transform: "translate(-100%, -50%)",
                              zIndex: 1,
                            }}
                          >
                            <PlusIcon />
                          </IconButton>
                        </DropdownMenu.Trigger>

                        <DropdownMenu.Content>
                          {compositeStatsKeys
                            .filter((item) => !session.columns.includes(item))
                            .map((key) => (
                              <DropdownMenu.Item
                                key={key}
                                onClick={() => {
                                  Session.mutate((draft) => {
                                    (draft as SessionTracking).columns.unshift(
                                      key
                                    );
                                  });
                                }}
                              >
                                {strings.common.composite_stats[key]}
                              </DropdownMenu.Item>
                            ))}
                        </DropdownMenu.Content>
                      </DropdownMenu.Root>
                    )}

                    <Select.Root
                      value={column}
                      onValueChange={(value) => {
                        Session.mutate((draft) => {
                          if (value === "remove") {
                            (draft as SessionTracking).columns.splice(index, 1);
                          } else {
                            (draft as SessionTracking).columns[index] =
                              value as CompositeStatsKey;
                          }
                        });
                      }}
                    >
                      <Select.Trigger variant="ghost" />

                      <Select.Content>
                        <Select.Item value="remove">
                          {strings.website.tools.session.table.remove}
                        </Select.Item>

                        <Select.Separator />

                        {compositeStatsKeys
                          .filter(
                            (item) =>
                              !session.columns.includes(item) || item === column
                          )
                          .map((key) => (
                            <Select.Item key={key} value={key}>
                              {strings.common.composite_stats[key]}
                            </Select.Item>
                          ))}
                      </Select.Content>
                    </Select.Root>
                  </Table.ColumnHeaderCell>
                ))}
              </Table.Row>
            </Table.Header>

            <Table.Body>
              <Table.Row
                style={{
                  overflow: "hidden",
                }}
              >
                <StickyRowHeaderCell
                  style={{
                    paddingLeft: 32,
                    position: "relative",
                    overflowY: "hidden",
                  }}
                >
                  {strings.website.tools.session.table.total}
                </StickyRowHeaderCell>
                {session.columns.map((column) => (
                  <Table.Cell align="center" key={column}>
                    {formatCompositeStat(total![column], column, total!)}
                  </Table.Cell>
                ))}
              </Table.Row>

              {delta.map(({ tank, composite }) => {
                return (
                  <Table.Row
                    key={tank.id}
                    style={{
                      overflow: "hidden",
                    }}
                  >
                    <TankRowHeaderCell tank={tank} />
                    {session.columns.map((column) => (
                      <Table.Cell align="center" key={column}>
                        {formatCompositeStat(
                          composite[column],
                          column,
                          composite
                        )}
                      </Table.Cell>
                    ))}
                  </Table.Row>
                );
              })}
            </Table.Body>
          </StickyTableRoot>
        </Flex>
      )}

      {session.tracking && delta && delta.length === 0 && (
        <Flex
          align="center"
          justify="center"
          direction="column"
          style={{
            flex: 1,
          }}
        >
          <Heading color="gray">
            {strings.website.tools.session.no_battles.title}
          </Heading>
          <Text color="gray">
            {strings.website.tools.session.no_battles.hint}
          </Text>
        </Flex>
      )}
    </PageWrapper>
  );
}
