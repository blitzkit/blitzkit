import { Slider } from "@radix-ui/themes";
import type { EmbedPreviewControllerProps } from "../../pages/[...locale]/embed/[embed]/_index";
import { EmbedState, type RadixSizeWithout0 } from "../../stores/embedState";

export function SizeWithout0({ configKey }: EmbedPreviewControllerProps) {
  return (
    <Slider
      variant="classic"
      min={1}
      max={9}
      value={[
        EmbedState.use((state) =>
          parseInt(state[configKey] as RadixSizeWithout0)
        ),
      ]}
      onValueChange={([value]) => {
        EmbedState.mutate((draft) => {
          draft[configKey] = `${value}`;
        });
      }}
    />
  );
}
