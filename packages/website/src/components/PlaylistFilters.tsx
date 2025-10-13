import { tankIcon } from "@blitzkit/core";
import { literals } from "@blitzkit/i18n";
import { Box, Flex, Grid, Text } from "@radix-ui/themes";
import { useMemo } from "react";
import usePromise from "react-promise-suspense";
import { awaitableTankDefinitions } from "../core/awaitables/tankDefinitions";
import { filterTanks } from "../core/blitzkit/filterTanks";
import { useLocale } from "../hooks/useLocale";
import { TankFilters } from "../stores/tankFilters";
import { LinkI18n } from "./LinkI18n";
import { FilterControl } from "./TankSearch/components/FilterControl";

const tankDefinitions = await awaitableTankDefinitions;

export function PlaylistPool() {
  const { strings, locale } = useLocale();
  const filters = TankFilters.use();
  const randomTankList = useMemo(() => {
    const list = Object.values(tankDefinitions.tanks);

    for (let i = list.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [list[i], list[j]] = [list[j], list[i]];
    }

    return list;
  }, [filters]);
  const tanks = usePromise(
    () => filterTanks(filters, randomTankList),
    // react-promise-suspense has awful type annotations
    [filters] as any
  );
  const tanksTrimmed = useMemo(() => tanks.slice(0, 48), [filters]);

  return (
    <Flex direction="column" gap="4" align="center">
      <FilterControl />

      <Text color="gray">
        {literals(strings.website.tools.playlist.pool_size, {
          count: tanks.length,
        })}
      </Text>

      <Box position="relative" height="100%" width="100%" overflow="hidden">
        <Grid
          columns="repeat(auto-fill, minmax(4rem, 1fr))"
          flow="dense"
          overflow="hidden"
          position="absolute"
          top="0"
          left="0"
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
        </Grid>

        <Box
          position="absolute"
          top="0"
          left="0"
          width="100%"
          height="100%"
          style={{
            background: "linear-gradient(transparent, var(--gray-1))",
            pointerEvents: "none",
          }}
        />
      </Box>
    </Flex>
  );
}
