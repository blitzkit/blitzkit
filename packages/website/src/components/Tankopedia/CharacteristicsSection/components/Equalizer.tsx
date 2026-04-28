import { asset } from "@blitzkit/core";
import { InfoCircledIcon } from "@radix-ui/react-icons";
import {
  Badge,
  Box,
  Flex,
  Heading,
  Link,
  Popover,
  Switch,
  Text,
} from "@radix-ui/themes";
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
        <Flex gap="2" align="center">
          {strings.website.tools.tankopedia.configuration.equalizer.title}{" "}
          <Badge variant="outline">
            {strings.website.tools.tankopedia.configuration.equalizer.beta}
          </Badge>
        </Flex>
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
