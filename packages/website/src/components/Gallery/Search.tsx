import { MagnifyingGlassIcon } from "@radix-ui/react-icons";
import { TextField } from "@radix-ui/themes";
import { useRef } from "react";
import { useLocale } from "../../hooks/useLocale";
import { Gallery } from "../../stores/gallery";
import type { MaybeSkeletonComponentProps } from "../../types/maybeSkeletonComponentProps";

export function GallerySearch({ skeleton }: MaybeSkeletonComponentProps) {
  const input = useRef<HTMLInputElement>(null);
  const { strings } = useLocale();

  return (
    <TextField.Root
      variant="classic"
      disabled={skeleton}
      placeholder={strings.website.tools.gallery.search.hint}
      ref={input}
      onChange={(event) => {
        Gallery.mutate((draft) => {
          const trimmed = event.target.value.trim();
          draft.search = trimmed.length === 0 ? undefined : trimmed;
        });
      }}
    >
      <TextField.Slot>
        <MagnifyingGlassIcon />
      </TextField.Slot>
    </TextField.Root>
  );
}
