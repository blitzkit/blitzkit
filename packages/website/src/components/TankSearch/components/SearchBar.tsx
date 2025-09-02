import type { TankDefinition } from "@blitzkit/core";
import { MagnifyingGlassIcon } from "@radix-ui/react-icons";
import { Flex, Spinner, TextField } from "@radix-ui/themes";
import { debounce } from "lodash-es";
import { type KeyboardEventHandler, useCallback, useRef } from "react";
import { useLocale } from "../../../hooks/useLocale";
import { TankFilters } from "../../../stores/tankFilters";
import type { MaybeSkeletonComponentProps } from "../../../types/maybeSkeletonComponentProps";
import { QuickLink } from "./QuickLink";
import { Sort } from "./Sort";

type SearchBarProps = MaybeSkeletonComponentProps & {
  topResult?: TankDefinition;
  onSelect?: (tank: TankDefinition) => void;
};

export function SearchBar({ topResult, skeleton, onSelect }: SearchBarProps) {
  const { strings } = useLocale();
  const search = TankFilters.use((state) => state.search);
  const searching = TankFilters.use((state) => state.searching);
  const input = useRef<HTMLInputElement>(null);
  const performSearch = useCallback(
    debounce(() => {
      TankFilters.mutate((draft) => {
        draft.searching = false;
      });

      if (!input.current) return;

      const sanitized = input.current.value.trim();

      TankFilters.mutate((draft) => {
        draft.search = sanitized.length === 0 ? null : sanitized;
      });
    }, 500),
    []
  );
  const handleChange = useCallback(() => {
    if (!searching) {
      TankFilters.mutate((draft) => {
        draft.searching = true;
      });
    }

    performSearch();
  }, [searching]);
  const handleKeyDown = useCallback<KeyboardEventHandler>(
    (event) => {
      if (event.key !== "Enter" || !topResult || searching) return;

      event.preventDefault();

      if (onSelect) {
        onSelect(topResult);
      } else {
        window.location.href = `/tanks/${topResult.slug}`;
      }
    },
    [topResult]
  );

  return (
    <Flex justify="center">
      <Flex gap="2" flexGrow="1">
        <TextField.Root
          variant="classic"
          disabled={skeleton}
          defaultValue={search ?? undefined}
          style={{ flex: 1 }}
          ref={input}
          placeholder={strings.website.common.tank_search.search_bar_hint}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
        >
          <TextField.Slot>
            {searching ? <Spinner /> : <MagnifyingGlassIcon />}
          </TextField.Slot>

          <QuickLink topResult={topResult} />
        </TextField.Root>

        <Sort />
      </Flex>
    </Flex>
  );
}
