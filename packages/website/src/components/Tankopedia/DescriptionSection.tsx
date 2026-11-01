import { DescriptionSource, type TankDescription } from "@blitzkit/core";
import { Flex, Heading, Link, Text } from "@radix-ui/themes";
import { useLocale } from "../../hooks/useLocale";

const sourceGames = {
  [DescriptionSource.DESCRIPTION_SOURCE_BLITZ]: {
    key: "blitz",
    url: "https://wotblitz.com",
  },
  [DescriptionSource.DESCRIPTION_SOURCE_WOT]: {
    key: "wot",
    url: "https://worldoftanks.com",
  },
} as const;

interface DescriptionSectionProps {
  description: TankDescription;
}

export function DescriptionSection({ description }: DescriptionSectionProps) {
  const { strings, unwrap } = useLocale();
  const sourceGame = sourceGames[description.source];

  return (
    <Flex direction="column" gap="4" align="center" px="4">
      <Heading size="6">
        {strings.website.tools.tankopedia.description_section.title}
      </Heading>

      <Flex direction="column" gap="2" maxWidth="35rem">
        <Text wrap="pretty">{unwrap(description.text!)}</Text>

        <Text size="1" color="gray" align="center" wrap="pretty">
          <Link href={sourceGame.url} target="_blank" color="gray">
            {
              strings.website.tools.tankopedia.description_section.games[
                sourceGame.key
              ]
            }
          </Link>{" "}
          {strings.website.tools.tankopedia.description_section.copyright}
        </Text>
      </Flex>
    </Flex>
  );
}
