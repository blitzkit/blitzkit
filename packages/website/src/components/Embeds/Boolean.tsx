import { Switch } from "@radix-ui/themes";
import type { EmbedPreviewControllerProps } from "../../pages/[...locale]/embed/[embed]/_index";
import { EmbedState } from "../../stores/embedState";

export function Boolean({ configKey }: EmbedPreviewControllerProps) {
  return (
    <Switch
      variant="classic"
      checked={EmbedState.use((state) => state[configKey] as boolean)}
      onCheckedChange={() => {
        EmbedState.mutate((draft) => {
          draft[configKey] = !draft[configKey];
        });
      }}
    />
  );
}
