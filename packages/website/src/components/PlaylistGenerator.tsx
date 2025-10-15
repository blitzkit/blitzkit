import { fisherYates, tankIcon } from "@blitzkit/core";
import { literals } from "@blitzkit/i18n";
import { ExclamationTriangleIcon } from "@radix-ui/react-icons";
import { Box, Button, Flex, Grid, Text } from "@radix-ui/themes";
import { useMemo } from "react";
import usePromise from "react-promise-suspense";
import { awaitableTankDefinitions } from "../core/awaitables/tankDefinitions";
import { filterTanks } from "../core/blitzkit/filterTanks";
import { generatePlaylist } from "../core/blitzkit/generatePlaylist";
import { useLocale } from "../hooks/useLocale";
import { App } from "../stores/app";
import { TankFilters } from "../stores/tankFilters";
import { LinkI18n } from "./LinkI18n";
import { FilterControl } from "./TankSearch/components/FilterControl";

const tankDefinitions = await awaitableTankDefinitions;

const POOL_HEIGHT = "16rem";

export function PlaylistGenerator() {
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
    <Flex justify="center" width="100%" gap="9" align="center">
      <Flex direction="column" gap="4" align="center">
        <FilterControl />

        <Button onClick={generatePlaylist} size="3">
          {strings.website.tools.playlist.generate}
        </Button>

        {!wargaming && (
          <Text color="gray">
            <Flex align="center" gap="1">
              <ExclamationTriangleIcon />
              {strings.website.tools.playlist.no_login_warning}
            </Flex>
          </Text>
        )}
      </Flex>

      <Flex
        direction="column"
        flexGrow="1"
        flexBasis="0"
        align="center"
        gap="4"
      >
        <Grid
          columns="repeat(auto-fill, minmax(4rem, 1fr))"
          flow="dense"
          overflow="hidden"
          position="relative"
          maxHeight={POOL_HEIGHT}
          width="100%"
        >
          {tanksTrimmed.map((tank) => (
            <LinkI18n
              target="_blank"
              locale={locale}
              href={`/tanks/${tank.slug}`}
              key={tank.id}
              style={{
                aspectRatio: "4 / 3",
                backgroundSize: "cover",
                backgroundPosition: "center",
                backgroundImage: `url(${tankIcon(tank.id)})`,
                backgroundRepeat: "no-repeat",
              }}
            />
          ))}

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
  );
}
