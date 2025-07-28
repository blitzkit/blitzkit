import type { TankDefinition } from '@blitzkit/core';
import { useStore } from '@nanostores/react';
import { MagnifyingGlassIcon } from '@radix-ui/react-icons';
import { Flex, Spinner, TextField } from '@radix-ui/themes';
import { debounce } from 'lodash-es';
import { type KeyboardEventHandler, useCallback, useRef } from 'react';
import { useLocale } from '../../../hooks/useLocale';
import { $tankFilters } from '../../../stores/tankFilters';
import type { MaybeSkeletonComponentProps } from '../../../types/maybeSkeletonComponentProps';
import { QuickLink } from './QuickLink';
import { Sort } from './Sort';

type SearchBarProps = MaybeSkeletonComponentProps & {
  topResult?: TankDefinition;
  onSelect?: (tank: TankDefinition) => void;
};

export function SearchBar({ topResult, skeleton, onSelect }: SearchBarProps) {
  const { strings } = useLocale();
  const tankFilters = useStore($tankFilters);
  const input = useRef<HTMLInputElement>(null);
  const performSearch = useCallback(
    debounce(() => {
      $tankFilters.setKey('searching', false);

      if (!input.current) return;

      const sanitized = input.current.value.trim();

      $tankFilters.setKey('search', sanitized.length === 0 ? null : sanitized);
    }, 500),
    [],
  );
  const handleChange = useCallback(() => {
    if (!tankFilters.searching) {
      $tankFilters.setKey('searching', true);
    }

    performSearch();
  }, [tankFilters]);
  const handleKeyDown = useCallback<KeyboardEventHandler>(
    (event) => {
      if (event.key !== 'Enter' || !topResult || tankFilters.searching) return;

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
    <Flex justify="center">
      <Flex gap="2" flexGrow="1">
        <TextField.Root
          variant="classic"
          disabled={skeleton}
          defaultValue={tankFilters.search ?? undefined}
          style={{ flex: 1 }}
          ref={input}
          placeholder={strings.website.common.tank_search.search_bar_hint}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
        >
          <TextField.Slot>
            {tankFilters.searching ? <Spinner /> : <MagnifyingGlassIcon />}
          </TextField.Slot>

          <QuickLink topResult={topResult} />
        </TextField.Root>

        <Sort />
      </Flex>
    </Flex>
  );
}
