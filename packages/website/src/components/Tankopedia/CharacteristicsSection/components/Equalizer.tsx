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
import { ConfigurationChildWrapper } from "./ConfigurationChildWrapper";

export function Equalizer() {
  const { strings } = useLocale();
  const equalize = Duel.use((state) => state.protagonist.equalize);

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

      <Popover.Root>
        <Popover.Trigger>
          <Text style={{ cursor: "pointer" }} size="2" color="gray">
            <Flex align="center" gap="2">
              Brought to you by{" "}
              <img
                src="/assets/images/third-party/wotb-news.png"
                style={{
                  width: "1rem",
                  height: "1rem",
                  objectFit: "cover",
                  borderRadius: "50%",
                }}
              />{" "}
              WoTB News <InfoCircledIcon />
            </Flex>
          </Text>
        </Popover.Trigger>

        <Popover.Content>
          <Text>
            This feature was brought to you early, ahead of the release of the
            game mode, thanks to{" "}
            <Link href="https://discord.gg/WHdER7ZPAD" target="_blank">
              WoTB News
            </Link>
            .
          </Text>
        </Popover.Content>
      </Popover.Root>
    </ConfigurationChildWrapper>
  );
}
