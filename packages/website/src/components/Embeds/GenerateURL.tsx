import {
  searchPlayersAcrossRegions,
  type AccountListItem,
  type AccountListWithServer,
} from "@blitzkit/core";
import { literals } from "@blitzkit/i18n/src/literals";
import { CaretLeftIcon, Link2Icon, PersonIcon } from "@radix-ui/react-icons";
import {
  Button,
  Dialog,
  Flex,
  Heading,
  Spinner,
  Text,
  TextField,
} from "@radix-ui/themes";
import { debounce } from "lodash-es";
import { useCallback, useRef, useState } from "react";
import { stringify } from "urlon";
import type { embedConfigurations } from "../../constants/embeds";
import { useLocale } from "../../hooks/useLocale";
import { EmbedState, type EmbedStateStore } from "../../stores/embedState";
import { CopyButton } from "../CopyButton";
import { SearchResults } from "../SearchResults";

interface GenerateURLProps {
  embed: keyof typeof embedConfigurations;
}

export function GenerateURL({ embed }: GenerateURLProps) {
  const [searchDialogOpen, setSearchDialogOpen] = useState(false);
  const [copyDialogOpen, setCopyDialogOpen] = useState(false);
  const [copyUser, setCopyUser] = useState<AccountListItem | null>(null);
  const input = useRef<HTMLInputElement>(null);
  const [searching, setSearching] = useState(false);
  const [results, setResults] = useState<AccountListWithServer>([]);
  const { strings } = useLocale();
  const performSearch = useCallback(
    debounce(async () => {
      if (!input.current) return;

      const sanitized = input.current.value.trim();

      if (sanitized.length === 0) {
        setSearching(false);
        return;
      }

      const results = await searchPlayersAcrossRegions(sanitized, 12);

      setSearching(false);
      setResults(results);
    }, 500),
    []
  );
  const handleChange = useCallback(() => {
    if (!input.current) return;

    const sanitized = input.current.value.trim();

    if (sanitized.length === 0) {
      setSearching(false);
      setResults([]);
    } else {
      setSearching(true);
      performSearch();
    }
  }, []);

  return (
    <>
      <Dialog.Root open={searchDialogOpen} onOpenChange={setSearchDialogOpen}>
        <Dialog.Trigger>
          <Button>
            <Link2Icon />
            {strings.website.tools.embed.configuration.export.generate.button}
          </Button>
        </Dialog.Trigger>

        <Dialog.Content width="fit-content">
          <Flex direction="column" gap="1">
            <Heading size="5">
              {strings.website.tools.embed.configuration.export.generate.title}
            </Heading>
            <Text color="gray">
              {
                strings.website.tools.embed.configuration.export.generate
                  .subtitle
              }
            </Text>
          </Flex>

          <TextField.Root
            variant="classic"
            mt="4"
            style={{ width: "20rem" }}
            placeholder={strings.website.common.player_search.hint}
            ref={input}
            onChange={handleChange}
          >
            <TextField.Slot>
              <PersonIcon />
            </TextField.Slot>
          </TextField.Root>

          <Flex justify="center" my="6">
            {searching && (
              <Text color="gray">
                <Flex align="center" gap="2">
                  <Spinner /> {strings.website.common.player_search.searching}
                </Flex>
              </Text>
            )}
            {!searching && results.length === 0 && (
              <Text color="gray">
                {strings.website.common.player_search.no_results}
              </Text>
            )}

            {!searching && results.length > 0 && (
              <SearchResults.Root>
                {results.map((result) => (
                  <SearchResults.Item
                    text={result.nickname}
                    discriminator={strings.common.regions.short[result.region]}
                    onClick={() => {
                      setCopyUser(result);
                      setCopyDialogOpen(true);
                      setSearchDialogOpen(false);
                    }}
                  />
                ))}
              </SearchResults.Root>
            )}
          </Flex>

          <Dialog.Close>
            <Button color="red" variant="outline" style={{ width: "100%" }}>
              {strings.website.tools.embed.configuration.export.generate.cancel}
            </Button>
          </Dialog.Close>
        </Dialog.Content>
      </Dialog.Root>

      <Dialog.Root open={copyDialogOpen} onOpenChange={setCopyDialogOpen}>
        <Dialog.Content style={{ width: "fit-content" }}>
          <Flex direction="column" gap="1">
            <Heading size="5">
              {
                strings.website.tools.embed.configuration.export.generate
                  .success.title
              }
            </Heading>
            <Text color="gray">
              {literals(
                strings.website.tools.embed.configuration.export.generate
                  .success.info,
                [`${copyUser?.nickname}`]
              )}
            </Text>
          </Flex>

          <Flex gap="2" mt="4">
            <Button
              style={{ flex: 1 }}
              variant="outline"
              onClick={() => {
                setCopyDialogOpen(false);
                setSearchDialogOpen(true);
              }}
            >
              <CaretLeftIcon />{" "}
              {
                strings.website.tools.embed.configuration.export.generate
                  .success.back
              }
            </Button>
            <CopyButton
              style={{ flex: 1 }}
              copy={() => {
                if (!copyUser) return;

                const shallowState: EmbedStateStore = {};

                Object.entries(EmbedState.state).forEach(([key, value]) => {
                  if (value !== EmbedState.initial[key]) {
                    shallowState[key] = value;
                  }
                });

                const searchParams = new URLSearchParams({
                  id: `${copyUser.account_id}`,
                  state: stringify(shallowState),
                });

                setSearchDialogOpen(false);
                setCopyDialogOpen(false);

                return `${location.origin}/embed/${embed}/host?${searchParams.toString()}`;
              }}
            >
              <Link2Icon />{" "}
              {
                strings.website.tools.embed.configuration.export.generate
                  .success.copy
              }
            </CopyButton>
          </Flex>
        </Dialog.Content>
      </Dialog.Root>
    </>
  );
}
