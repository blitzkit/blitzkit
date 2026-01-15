import { MagnifyingGlassIcon } from "@radix-ui/react-icons";
import { useRef } from "react";
import { useStrings } from "../../hooks/useStrings";
import { Avatars } from "../../stores/avatars";
import { TextField } from "../TextField";
import "./index.css";

export function AvatarControls() {
  const strings = useStrings();
  const search = useRef<HTMLInputElement>(null);

  return (
    <div className="avatar-controls">
      <TextField
        ref={search}
        className="search"
        placeholder={strings.avatars.search}
        onChange={(event) => {
          const trimmed = event.target.value.trim();

          Avatars.mutate((draft) => {
            if (trimmed.length === 0) {
              draft.search = null;
            } else {
              draft.search = trimmed;
            }
          });
        }}
      >
        <MagnifyingGlassIcon />
      </TextField>
    </div>
  );
}
