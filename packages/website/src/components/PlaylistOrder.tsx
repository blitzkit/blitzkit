import { Box, Flex } from "@radix-ui/themes";
import { CurrentlyPlaying } from "./CurrentlyPlaying";
import { PlaylistActions } from "./PlaylistActions";
import { PlaylistTable } from "./PlaylistTable";

export function PlaylistOrder() {
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
      <PlaylistActions />

      <Box flexGrow="1" width="100%" position="relative">
        <PlaylistTable />
      </Box>
    </Flex>
  );
}
