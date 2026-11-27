import {
  searchPlayersAcrossRegions,
  type AccountListItem,
  type AccountListWithServer,
} from "@blitzkit/core";
import { literals } from "@blitzkit/i18n";
import { CaretLeftIcon, Link2Icon, PersonIcon } from "@radix-ui/react-icons";
import { debounce } from "lodash-es";
import { useCallback, useRef, useState } from "react";
import { stringify } from "urlon";
import type { embedConfigurations } from "../../../config/embeds";
import { useStrings } from "../../../hooks/useStrings";
import { EmbedState, type EmbedStateStore } from "../../../stores/embedState";
import { Button } from "../../Button";
import { CopyButton } from "../../CopyButton";
import { Dialog } from "../../Dialog";
import { SearchResults } from "../../SearchResults";
import { Spinner } from "../../Spinner";
import { Text } from "../../Text";
import { TextField } from "../../TextField";
import styles from "./index.module.css";

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
  const strings = useStrings();
  const generateStrings = strings.embed.configuration.export.generate;

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
    [],
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
  }, [performSearch]);

  return (
    <>
      <Dialog.Root open={searchDialogOpen} onOpenChange={setSearchDialogOpen}>
        <Dialog.Trigger asChild>
          <Button>
            <Link2Icon />
            {generateStrings.button}
          </Button>
        </Dialog.Trigger>

        <Dialog.Portal>
          <Dialog.Overlay />
          <Dialog.Content className={styles.content}>
            <Dialog.Header>
              <Dialog.Title>{generateStrings.title}</Dialog.Title>
              <Dialog.Description>
                {generateStrings.subtitle}
              </Dialog.Description>
            </Dialog.Header>

            <Dialog.Body>
              <TextField
                placeholder={strings.common.search.hint_players}
                ref={input}
                onChange={handleChange}
              >
                <PersonIcon />
              </TextField>

              <div className={styles.results}>
                {searching && (
                  <Text lowContrast className={styles.searching}>
                    <Spinner />
                    {strings.common.search.searching}
                  </Text>
                )}

                {!searching && results.length === 0 && (
                  <Text lowContrast>{strings.common.search.no_results}</Text>
                )}

                {!searching && results.length > 0 && (
                  <SearchResults.Root>
                    {results.map((result) => (
                      <SearchResults.Item
                        key={`${result.region}-${result.account_id}`}
                        text={result.nickname}
                        discriminator={
                          strings.common.regions.short[result.region]
                        }
                        onClick={() => {
                          setCopyUser(result);
                          setCopyDialogOpen(true);
                          setSearchDialogOpen(false);
                        }}
                      />
                    ))}
                  </SearchResults.Root>
                )}
              </div>
            </Dialog.Body>

            <Dialog.Actions>
              <Dialog.Close asChild>
                <Button color="red" variant="outline">
                  {generateStrings.cancel}
                </Button>
              </Dialog.Close>
            </Dialog.Actions>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

      <Dialog.Root open={copyDialogOpen} onOpenChange={setCopyDialogOpen}>
        <Dialog.Portal>
          <Dialog.Overlay />
          <Dialog.Content className={styles.content}>
            <Dialog.Header>
              <Dialog.Title>{generateStrings.success.title}</Dialog.Title>
              <Dialog.Description>
                {literals(generateStrings.success.info, {
                  name: copyUser?.nickname,
                })}
              </Dialog.Description>
            </Dialog.Header>

            <Dialog.Actions>
              <Button
                variant="outline"
                onClick={() => {
                  setCopyDialogOpen(false);
                  setSearchDialogOpen(true);
                }}
              >
                <CaretLeftIcon />
                {generateStrings.success.back}
              </Button>
              <CopyButton
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

                  return `${
                    location.origin
                  }/embed/${embed}/host?${searchParams.toString()}`;
                }}
              >
                <Link2Icon />
                {generateStrings.success.copy}
              </CopyButton>
            </Dialog.Actions>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </>
  );
}
