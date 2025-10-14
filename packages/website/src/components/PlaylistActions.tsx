import { CaretDownIcon } from "@radix-ui/react-icons";
import { Button, Flex } from "@radix-ui/themes";
import { useLocale } from "../hooks/useLocale";
import { Playlist } from "../stores/playlist";

export function PlaylistActions() {
  const { strings } = useLocale();

  return (
    <Flex gap="2">
      <Button
        variant="outline"
        color="red"
        onClick={() => {
          Playlist.mutate((draft) => {
            draft.list = undefined;
          });
        }}
      >
        {strings.website.tools.playlist.reset}
      </Button>

      <Button variant="outline">
        {strings.website.tools.playlist.shuffle}
      </Button>

      <Button>
        {strings.website.tools.playlist.sort}
        <CaretDownIcon />
      </Button>
    </Flex>
  );
}
