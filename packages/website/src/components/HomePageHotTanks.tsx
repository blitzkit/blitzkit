import { literals } from "@blitzkit/i18n/src/literals";
import { EyeOpenIcon } from "@radix-ui/react-icons";
import { Box, Flex, Heading, Text } from "@radix-ui/themes";
import { awaitablePopularTanks } from "../core/awaitables/popularTanks";
import { awaitableTankDefinitions } from "../core/awaitables/tankDefinitions";
import {
  LocaleProvider,
  useLocale,
  type LocaleAcceptorProps,
} from "../hooks/useLocale";
import { TankCard } from "./TankCard";

const [tankDefinitions, popularTanks] = await Promise.all([
  awaitableTankDefinitions,
  awaitablePopularTanks,
]);

export function HomePageHotTanks({ locale }: LocaleAcceptorProps) {
  return (
    <LocaleProvider locale={locale}>
      <Content />
    </LocaleProvider>
  );
}

function Content() {
  const { locale, strings } = useLocale();

  return (
    <Flex direction="column" pt="4" pb="6">
      <Heading align="center" size="5">
        {strings.website.home.hot_tanks.title}
      </Heading>
      <Text color="gray" align="center" mb="5" size="2">
        {literals(strings.website.home.hot_tanks.subtitle, { days: 7 })}
      </Text>

      <Flex justify="center" gap="4" wrap="wrap">
        {popularTanks.tanks.map(({ id, views }) => {
          const tank = tankDefinitions.tanks[id];

          if (tank === undefined) return null;

          return (
            <Box width="7rem" key={tank.id}>
              <TankCard
                tank={tank}
                discriminator={
                  <Flex align="center" gap="1" justify="center">
                    <EyeOpenIcon />
                    {Math.round(views * (30 / 7)).toLocaleString(locale)}
                  </Flex>
                }
              />
            </Box>
          );
        })}
      </Flex>
    </Flex>
  );
}
