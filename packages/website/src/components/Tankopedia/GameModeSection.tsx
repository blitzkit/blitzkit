import { asset } from "@blitzkit/core";
import { Box, Flex, Heading, Text } from "@radix-ui/themes";
import { awaitableConsumableDefinitions } from "../../core/awaitables/consumableDefinitions";
import { awaitableGameDefinitions } from "../../core/awaitables/gameDefinitions";
import { awaitableProvisionDefinitions } from "../../core/awaitables/provisionDefinitions";
import { useLocale } from "../../hooks/useLocale";
import { Duel } from "../../stores/duel";

const [gameDefinitions, consumableDefinitions, provisionDefinitions] =
  await Promise.all([
    awaitableGameDefinitions,
    awaitableConsumableDefinitions,
    awaitableProvisionDefinitions,
  ]);

export function GameModeSection() {
  const { unwrap, strings } = useLocale();
  const tank = Duel.use((state) => state.protagonist.tank);
  const roles = Object.entries(tank.roles);

  if (roles.length === 0) return null;

  return (
    <Flex direction="column" gap="4" align="center">
      <Heading size="6">
        {strings.website.tools.tankopedia.game_modes.title}
      </Heading>

      <Flex justify="center" gap="4" wrap="wrap" px="4">
        {roles.map(([key, value]) => {
          const id = Number(key);
          const gameMode = gameDefinitions.gameModes[id];

          return (
            <Flex
              key={id}
              width="16rem"
              height="20rem"
              overflow="hidden"
              direction="column"
              style={{
                borderRadius: "var(--radius-3)",
                background: `url(${asset(
                  `icons/game_mode_banners/${id}.webp`
                )})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
              }}
            >
              <Box
                flexGrow="1"
                style={{
                  background: `url(${asset(
                    `icons/game_mode_banners/${id}.webp`
                  )})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }}
              />

              <Flex
                p="3"
                direction="column"
                height="98px"
                flexShrink="0"
                style={{
                  backdropFilter: "blur(4rem)",
                  WebkitBackdropFilter: "blur(4rem)",
                }}
                align="center"
                justify="center"
              >
                <Text size="4" weight="bold">
                  {unwrap(gameMode.name)}
                </Text>

                <Flex direction="column">
                  {gameDefinitions.roles[value].provisions.map((id) => {
                    const provisions = provisionDefinitions.provisions[id];

                    return (
                      <Text color="gray" wrap="nowrap" key={id}>
                        <Flex align="center" gap="1">
                          <img
                            style={{
                              width: "1.5em",
                              height: "1.5em",
                              objectFit: "contain",
                            }}
                            src={asset(`icons/provisions/${id}.webp`)}
                            alt={unwrap(provisions.name)}
                          />
                          {unwrap(provisions.name)}
                        </Flex>
                      </Text>
                    );
                  })}

                  {gameDefinitions.roles[value].consumables.map((id) => {
                    const consumable = consumableDefinitions.consumables[id];

                    return (
                      <Text color="gray" wrap="nowrap" key={id}>
                        <Flex align="center" gap="1">
                          <img
                            style={{
                              width: "1.5em",
                              height: "1.5em",
                              objectFit: "contain",
                            }}
                            src={asset(`icons/consumables/${id}.webp`)}
                            alt={unwrap(consumable.name)}
                          />
                          {unwrap(consumable.name)}
                        </Flex>
                      </Text>
                    );
                  })}
                </Flex>
              </Flex>
            </Flex>
          );
        })}
      </Flex>
    </Flex>
  );
}
