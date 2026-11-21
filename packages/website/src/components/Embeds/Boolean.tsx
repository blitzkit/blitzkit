import type { EmbedPreviewControllerProps } from "../../pages/[...chunk_default]/[...locale]/embed/[embed]/_index";
import { EmbedState } from "../../stores/embedState";
import { Switch } from "../Switch";

export function Boolean({ configKey }: EmbedPreviewControllerProps) {
  return (
    <Switch
      checked={EmbedState.use((state) => state[configKey] as boolean)}
      onCheckedChange={() => {
        EmbedState.mutate((draft) => {
          draft[configKey] = !draft[configKey];
        });
      }}
    />
  );
}
