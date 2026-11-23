import type { TankDefinition } from "@blitzkit/protos";
import { MagnifyingGlassIcon } from "@radix-ui/react-icons";
import {
  type KeyboardEventHandler,
  useCallback,
  useEffect,
  useRef,
} from "react";
import { withLocale } from "../../hocs/withLocale";
import { useStrings } from "../../hooks/useStrings";
import { TankFilters } from "../../stores/tankFilters";
import { TankSearchSort } from "../TankSearchSort";
import { TextField } from "../TextField";

type SearchBarProps = {
  topResult?: TankDefinition;
  onSelect?: (tank: TankDefinition) => void;
};

export const TankSearchBar = withLocale(Content);

function Content({ topResult, onSelect }: SearchBarProps) {
  const strings = useStrings();

  const search = TankFilters.use((state) => state.search);

  const input = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (search !== null) return;
    input.current!.value = "";
  }, [search]);

  const handleChange = useCallback(() => {
    if (!input.current) return;

    const sanitized = input.current.value.trim();

    TankFilters.mutate((draft) => {
      draft.search = sanitized.length === 0 ? null : sanitized;
    });
  }, []);
  const handleKeyDown = useCallback<KeyboardEventHandler>(
    (event) => {
      if (event.key !== "Enter" || !topResult || !TankFilters.state.search) {
        return;
      }

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
    <div style={{ display: "flex", gap: "var(--space-3)" }}>
      <TextField
        defaultValue={search ?? undefined}
        style={{ flex: 1 }}
        ref={input}
        placeholder={strings.website.common.tank_search.search_bar_hint}
        autoFocus="fine"
        onChange={handleChange}
        onKeyDown={handleKeyDown}
      >
        <MagnifyingGlassIcon />
      </TextField>

      <TankSearchSort />
    </div>
  );
}
