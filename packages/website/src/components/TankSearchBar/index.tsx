import type { TankDefinition } from "@blitzkit/core";
import { MagnifyingGlassIcon } from "@radix-ui/react-icons";
import { type KeyboardEventHandler, useCallback, useRef } from "react";
import { useLocale } from "../../hooks/useLocale";
import { TankFilters } from "../../stores/tankFilters";
import type { MaybeSkeletonComponentProps } from "../../types/maybeSkeletonComponentProps";
import { Flex } from "../Flex";
import { Sort } from "../TankSearch/components/Sort";
import { TextField } from "../TextField";

type SearchBarProps = MaybeSkeletonComponentProps & {
  topResult?: TankDefinition;
  onSelect?: (tank: TankDefinition) => void;
};

export function TankSearchBar({
  topResult,
  skeleton,
  onSelect,
}: SearchBarProps) {
  const { strings } = useLocale();
  const search = TankFilters.use((state) => state.search);
  const input = useRef<HTMLInputElement>(null);
  const handleChange = useCallback(() => {
    if (!input.current) return;

    const sanitized = input.current.value.trim();

    TankFilters.mutate((draft) => {
      draft.search = sanitized.length === 0 ? null : sanitized;
    });
  }, []);
  const handleKeyDown = useCallback<KeyboardEventHandler>(
    (event) => {
      if (event.key !== "Enter" || !topResult) return;

      event.preventDefault();

      if (onSelect) {
        onSelect(topResult);
      } else {
        window.location.href = `/tanks/${topResult.slug}`;
      }
    },
    [topResult],
  );

  return (
    <Flex gap="3">
      <TextField
        disabled={skeleton}
        defaultValue={search ?? undefined}
        style={{ flex: 1 }}
        ref={input}
        placeholder={strings.website.common.tank_search.search_bar_hint}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
      >
        <MagnifyingGlassIcon />
      </TextField>

      <Sort />
    </Flex>
  );
}
