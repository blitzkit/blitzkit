import { Slider } from "@radix-ui/themes";
import type { EmbedPreviewControllerProps } from "../../pages/[...locale]/embed/[embed]/_index";
import { EmbedState, type RadixSize } from "../../stores/embedState";

export function Size({ configKey }: EmbedPreviewControllerProps) {
  return (
    <Slider
      variant="classic"
      min={0}
      max={9}
      value={[
        EmbedState.use((state) => parseInt(state[configKey] as RadixSize)),
      ]}
      onValueChange={([value]) => {
        EmbedState.mutate((draft) => {
          draft[configKey] = `${value}`;
        });
      }}
    />
  );
}
