import type { TankMechanic } from "@blitzkit/core/src/blitzkit/tankMechanics";
import { Card, Flex, Heading, Text } from "@radix-ui/themes";
import { useLocale } from "../../hooks/useLocale";
import { Duel } from "../../stores/duel";
import { MechanicIcon } from "../MechanicIcon";

export function MechanicsSection() {
  const { strings } = useLocale();
  const mechanics = Duel.use(
    (state) => state.protagonist.tank.mechanics,
  ) as TankMechanic[];

  if (mechanics.length === 0) return null;

  return (
    <Flex direction="column" gap="4" align="center">
      <Heading size="6">
        {strings.website.tools.tankopedia.mechanics.title}
      </Heading>

      <Flex justify="center" gap="4" wrap="wrap" px="4">
        {mechanics.map((mechanic) => (
          <Card key={mechanic} style={{ width: "20rem" }}>
            <Flex gap="3" align="center">
              <MechanicIcon mechanic={mechanic} size="2.5rem" />

              <Flex direction="column" gap="1">
                <Text weight="bold">
                  {strings.website.common.tank_mechanics[mechanic].name}
                </Text>
                <Text size="2" color="gray">
                  {strings.website.common.tank_mechanics[mechanic].description}
                </Text>
              </Flex>
            </Flex>
          </Card>
        ))}
      </Flex>
    </Flex>
  );
}
