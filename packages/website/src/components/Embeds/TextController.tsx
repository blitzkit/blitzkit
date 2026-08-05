import { TextField } from "@radix-ui/themes";
import type { EmbedPreviewControllerProps } from "../../pages/[...chunk_default]/[...locale]/embed/[embed]/_index";
import { EmbedState } from "../../stores/embedState";

export function TextController({ configKey }: EmbedPreviewControllerProps) {
  return (
    <TextField.Root
      variant="classic"
      placeholder="Empty"
      value={EmbedState.use((state) => state[configKey] as string)}
      onChange={(event) => {
        EmbedState.mutate((draft) => {
          draft[configKey] = event.target.value;
        });
      }}
    />
  );
}
