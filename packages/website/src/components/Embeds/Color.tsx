import type { EmbedPreviewControllerProps } from "../../pages/[...locale]/embed/[embed]/_index";
import { EmbedState } from "../../stores/embedState";
import { ColorControllerRaw } from "./ColorControllerRaw";

export function Color({ configKey }: EmbedPreviewControllerProps) {
  const color = EmbedState.use((state) => state[configKey] as string);

  return (
    <ColorControllerRaw
      value={color}
      onValueChange={(value) => {
        EmbedState.mutate((draft) => {
          draft[configKey] = value;
        });
      }}
    />
  );
}
