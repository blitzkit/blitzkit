import { ExclamationTriangleIcon } from "@radix-ui/react-icons";
import { Button, Flex, Text } from "@radix-ui/themes";
import { generatePlaylist } from "../core/blitzkit/generatePlaylist";
import { useLocale } from "../hooks/useLocale";
import { App } from "../stores/app";

export function PlaylistGenerator() {
  const { strings } = useLocale();
  const wargaming = App.use((state) => state.logins.wargaming);

  return (
    <Flex
      flexGrow="1"
      flexBasis="1"
      direction="column"
      align="center"
      justify="center"
      gap="4"
    >
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
  );
}
