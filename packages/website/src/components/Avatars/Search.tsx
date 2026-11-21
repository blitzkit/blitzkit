import { MagnifyingGlassIcon } from "@radix-ui/react-icons";
import { useRef } from "react";
import { useLocale } from "../../hooks/useLocale";
import { Gallery } from "../../stores/gallery";
import type { MaybeSkeletonComponentProps } from "../../types/maybeSkeletonComponentProps";
import { TextField } from "../TextField";

export function AvatarsSearch({ skeleton }: MaybeSkeletonComponentProps) {
  const input = useRef<HTMLInputElement>(null);
  const { strings } = useLocale();

  return (
    <TextField
      disabled={skeleton}
      placeholder={strings.website.tools.avatars.search.hint}
      ref={input}
      onChange={(event) => {
        Gallery.mutate((draft) => {
          const trimmed = event.target.value.trim();
          draft.search = trimmed.length === 0 ? undefined : trimmed;
        });
      }}
    >
      <MagnifyingGlassIcon />
    </TextField>
  );
}
