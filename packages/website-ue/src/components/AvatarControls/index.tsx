import { MagnifyingGlassIcon } from "@radix-ui/react-icons";
import { useCallback, useEffect, useRef } from "react";
import { useStrings } from "../../hooks/useStrings";
import { Avatars } from "../../stores/avatars";
import { TextField } from "../TextField";
import "./index.css";

export function AvatarControls() {
  const strings = useStrings();
  const search = useRef<HTMLInputElement>(null);

  const onChange = useCallback(() => {
    if (!search.current) return;

    const trimmed = search.current.value.trim();

    Avatars.mutate((draft) => {
      if (trimmed.length === 0) {
        draft.search = null;
      } else {
        draft.search = trimmed;
      }
    });
  }, []);

  useEffect(onChange, []);

  return (
    <div className="avatar-controls">
      <TextField
        ref={search}
        className="search"
        placeholder={strings.avatars.search}
        onLoad={onChange}
      >
        <MagnifyingGlassIcon />
      </TextField>
    </div>
  );
}
