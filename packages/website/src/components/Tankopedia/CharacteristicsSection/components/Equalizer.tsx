import { asset } from "@blitzkit/core";
import { Box, Flex, Heading, Switch, Text } from "@radix-ui/themes";
import { useLocale } from "../../../../hooks/useLocale";
import { Duel } from "../../../../stores/duel";
import { ConfigurationChildWrapper } from "./ConfigurationChildWrapper";

export function Equalizer() {
  const { strings } = useLocale();
  const equalize = Duel.use((state) => state.protagonist.equalize);

  return (
    <ConfigurationChildWrapper>
      <Heading size="4">
        {strings.website.tools.tankopedia.configuration.equalizer.title}
      </Heading>

      <Box
        onClick={() => {
          Duel.mutate((draft) => {
            draft.protagonist.equalize = !draft.protagonist.equalize;
          });
        }}
        width="100%"
        style={{
          cursor: "pointer",
          borderRadius: "var(--radius-3)",
          backgroundImage: `url(${asset("icons/game_mode_banners/45.webp")})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          overflow: "hidden",
        }}
      >
        <Flex
          align="center"
          width="100%"
          justify="between"
          p="4"
          style={{
            background:
              "linear-gradient(90deg, var(--black-a3), var(--gray-1))",
          }}
        >
          <Text>
            {strings.website.tools.tankopedia.configuration.equalizer.equalize}
          </Text>
          <Switch checked={equalize} />
        </Flex>
      </Box>
    </ConfigurationChildWrapper>
  );
}
