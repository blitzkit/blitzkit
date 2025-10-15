import { fisherYates } from "@blitzkit/core";
import { CaretDownIcon } from "@radix-ui/react-icons";
import { Button, DropdownMenu, Flex, Spinner } from "@radix-ui/themes";
import { useLocale } from "../hooks/useLocale";
import { App } from "../stores/app";
import { Playlist } from "../stores/playlist";

export function PlaylistActions() {
  const { strings } = useLocale();
  const wargaming = App.use((state) => state.logins.wargaming);

  return (
    <>
      <Flex gap="2">
        <Button
          size={{ initial: "1", xs: "2" }}
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

        <Button
          size={{ initial: "1", xs: "2" }}
          variant={wargaming ? "outline" : undefined}
          onClick={() => {
            Playlist.mutate((draft) => {
              if (draft.list) fisherYates(draft.list);
            });
          }}
        >
          {strings.website.tools.playlist.shuffle}
        </Button>

        {wargaming && (
          <>
            <Button
              size={{ initial: "1", xs: "2" }}
              variant="outline"
              onClick={() => {
                Playlist.mutate((draft) => {
                  draft.list = draft.list?.filter(
                    (entry) =>
                      !entry.now ||
                      !entry.then ||
                      entry.now.battles === entry.then.battles
                  );
                });
              }}
            >
              {strings.website.tools.playlist.remove}
            </Button>

            <DropdownMenu.Root>
              <DropdownMenu.Trigger>
                <Button size={{ initial: "1", xs: "2" }}>
                  {strings.website.tools.playlist.sort.button}
                  <CaretDownIcon />
                </Button>
              </DropdownMenu.Trigger>

              <DropdownMenu.Content>
                <DropdownMenu.Item
                  onClick={() => {
                    Playlist.mutate((draft) => {
                      draft.list = draft.list?.sort(
                        (a, b) => (a.then?.last ?? 0) - (b.then?.last ?? 0)
                      );
                    });
                  }}
                >
                  {strings.website.tools.playlist.sort.last_played}
                </DropdownMenu.Item>
                <DropdownMenu.Item
                  onClick={() => {
                    Playlist.mutate((draft) => {
                      draft.list = draft.list?.sort(
                        (a, b) =>
                          (a.then?.battles ?? 0) - (b.then?.battles ?? 0)
                      );
                    });
                  }}
                >
                  {strings.website.tools.playlist.sort.least_played}
                </DropdownMenu.Item>
              </DropdownMenu.Content>
            </DropdownMenu.Root>
          </>
        )}
      </Flex>

      {wargaming && (
        <Flex gap="2" align="center">
          <Spinner />
          {strings.website.tools.playlist.tracking}
        </Flex>
      )}
    </>
  );
}
