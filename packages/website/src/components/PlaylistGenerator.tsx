import { fisherYates, tankIcon } from "@blitzkit/core";
import { literals } from "@blitzkit/i18n";
import { ChevronRightIcon } from "@radix-ui/react-icons";
import {
  AlertDialog,
  Box,
  Button,
  Flex,
  Grid,
  Skeleton,
  Text,
} from "@radix-ui/themes";
import { useMemo, useState } from "react";
import usePromise from "react-promise-suspense";
import { awaitableTankDefinitions } from "../core/awaitables/tankDefinitions";
import { filterTanks } from "../core/blitzkit/filterTanks";
import { generatePlaylist } from "../core/blitzkit/generatePlaylist";
import { useLocale } from "../hooks/useLocale";
import { App } from "../stores/app";
import { TankFilters } from "../stores/tankFilters";
import type { MaybeSkeletonComponentProps } from "../types/maybeSkeletonComponentProps";
import { LinkI18n } from "./LinkI18n";
import { FilterControl } from "./TankSearch/components/FilterControl";

const tankDefinitions = await awaitableTankDefinitions;

const POOL_HEIGHT = "16rem";

export function PlaylistGenerator({ skeleton }: MaybeSkeletonComponentProps) {
  const [largeWarningOpen, setLargeWarningOpen] = useState(false);
  const { strings, locale } = useLocale();
  const wargaming = App.use((state) => state.logins.wargaming);
  const filters = TankFilters.use();
  const randomTankList = useMemo(
    () => fisherYates(Object.values(tankDefinitions.tanks)),
    [filters]
  );
  const tanks = usePromise(
    () => filterTanks(filters, randomTankList, wargaming?.id),
    // react-promise-suspense has awful type annotations
    [filters] as any
  );
  const tanksTrimmed = useMemo(() => tanks.slice(0, 65), [filters]);

  return (
    <>
      <AlertDialog.Root
        open={largeWarningOpen}
        onOpenChange={setLargeWarningOpen}
      >
        <AlertDialog.Content>
          <AlertDialog.Title>
            {strings.website.tools.playlist.large_warning.title}
          </AlertDialog.Title>
          <AlertDialog.Description>
            {literals(
              strings.website.tools.playlist.large_warning.description,
              {
                count: tanks.length,
                time: Math.round(tanks.length * ((2 * 4) / 60)),
              }
            )}
          </AlertDialog.Description>

          <Flex justify="end" gap="2" mt="4">
            <AlertDialog.Cancel>
              <Button variant="outline">
                {strings.website.tools.playlist.large_warning.cancel}
              </Button>
            </AlertDialog.Cancel>
            <AlertDialog.Action onClick={generatePlaylist}>
              <Button color="red">
                {strings.website.tools.playlist.large_warning.proceed}
              </Button>
            </AlertDialog.Action>
          </Flex>
        </AlertDialog.Content>
      </AlertDialog.Root>

      <Flex justify="center" width="100%" align="center" px="4">
        <Flex
          flexGrow="1"
          gap="9"
          align="center"
          justify="center"
          maxWidth="80rem"
          direction={{ initial: "column-reverse", md: "row" }}
        >
          <Flex direction="column" gap="4" align="center">
            <FilterControl />

            <Button
              onClick={() => {
                if (tanks.length >= 32) {
                  setLargeWarningOpen(true);
                  return;
                }

                generatePlaylist();
              }}
              size="3"
            >
              {strings.website.tools.playlist.generate} <ChevronRightIcon />
            </Button>
          </Flex>

          <Flex
            direction="column"
            flexGrow="1"
            flexBasis="0"
            align="center"
            gap="4"
            width="100%"
          >
            <Grid
              columns="repeat(auto-fill, minmax(4rem, 1fr))"
              flow="dense"
              overflow="hidden"
              position="relative"
              maxHeight={POOL_HEIGHT}
              width="100%"
            >
              {tanksTrimmed.map((tank) =>
                skeleton ? (
                  <Box
                    key={tank.id}
                    width="100%"
                    height="100%"
                    style={{ aspectRatio: "4 / 3" }}
                    p="1"
                  >
                    <Skeleton width="100%" height="100%" />
                  </Box>
                ) : (
                  <LinkI18n
                    key={tank.id}
                    target="_blank"
                    locale={locale}
                    href={`/tanks/${tank.slug}`}
                    style={{
                      aspectRatio: "4 / 3",
                      backgroundSize: "cover",
                      backgroundPosition: "center",
                      backgroundImage: `url(${tankIcon(tank.id)})`,
                      backgroundRepeat: "no-repeat",
                    }}
                  />
                )
              )}

              <Box
                position="absolute"
                top="0"
                left="0"
                width="100%"
                height="100%"
                style={{
                  pointerEvents: "none",
                  background: `linear-gradient(transparent, var(--gray-1) ${POOL_HEIGHT})`,
                }}
              />
            </Grid>

            <Text color="gray">
              {literals(strings.website.tools.playlist.pool_size, {
                count: tanks.length,
              })}
            </Text>
          </Flex>
        </Flex>
      </Flex>
    </>
  );
}
