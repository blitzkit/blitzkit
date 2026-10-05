import { alias } from "@blitzkit/core";
import { Box, Flex, Heading, Switch, Text } from "@radix-ui/themes";
import { useLocale } from "../../../../hooks/useLocale";
import { Duel } from "../../../../stores/duel";
import { Tankopedia } from "../../../../stores/tankopedia";
import { ConfigurationChildWrapper } from "./ConfigurationChildWrapper";

export function Equalizer() {
  const { strings } = useLocale();
  const equalize = Duel.use((state) => state.equalize);

  return (
    <ConfigurationChildWrapper>
      <Heading size="4">
        {strings.website.tools.tankopedia.configuration.equalizer.title}
      </Heading>

      <Box
        mt="2"
        onClick={() => {
          Duel.mutate((draft) => {
            draft.equalize = !draft.equalize;
          });
          Tankopedia.mutate((draft) => {
            draft.shot = undefined;
          });
        }}
        width="100%"
        style={{
          cursor: "pointer",
          borderRadius: "var(--radius-3)",
          backgroundImage: `
            linear-gradient(90deg, var(--black-a3), var(--gray-1)),
            url(${alias("api", `/gamemodes/Insanity/banner.webp`)})
          `,
          backgroundSize: "cover",
          backgroundPosition: "50% 25%",
          overflow: "hidden",
        }}
      >
        <Flex align="center" width="100%" justify="between" p="4">
          <Text
            style={{
              textShadow: "0 0 var(--space-1) var(--black-a12)",
            }}
          >
            {strings.website.tools.tankopedia.configuration.equalizer.equalize}
          </Text>
          <Switch checked={equalize} />
        </Flex>
      </Box>
    </ConfigurationChildWrapper>
  );
}
