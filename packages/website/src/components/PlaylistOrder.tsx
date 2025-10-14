import { Box, Button, Flex } from "@radix-ui/themes";
import { useLocale } from "../hooks/useLocale";
import { Playlist } from "../stores/playlist";
import { CurrentlyPlaying } from "./CurrentlyPlaying";
import { PlaylistTable } from "./PlaylistTable";

export function PlaylistOrder() {
  const { strings } = useLocale();

  return (
    <Flex
      direction="column"
      gap="4"
      align="center"
      flexGrow="1"
      flexBasis="0"
      maxHeight="100%"
    >
      <CurrentlyPlaying />

      <Button
        onClick={() => {
          Playlist.mutate((draft) => {
            draft.list = undefined;
          });
        }}
      >
        {strings.website.tools.playlist.clear}
      </Button>

      <Box flexGrow="1" width="100%" position="relative">
        <PlaylistTable />
      </Box>
    </Flex>
  );
}
