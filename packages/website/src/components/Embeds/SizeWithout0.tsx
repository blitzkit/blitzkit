import type { EmbedPreviewControllerProps } from "../../pages/[...chunk_default]/[...locale]/embed/[embed]/_index";
import { EmbedState } from "../../stores/embedState";
import type { SpaceWithout0 } from "../../types/styles";
import { RangeSlider } from "./RangeSlider";

export function SizeWithout0({ configKey }: EmbedPreviewControllerProps) {
  return (
    <RangeSlider
      min={1}
      max={9}
      value={EmbedState.use((state) =>
        parseInt(state[configKey] as SpaceWithout0),
      )}
      onValueChange={(value) => {
        EmbedState.mutate((draft) => {
          draft[configKey] = `${value}`;
        });
      }}
    />
  );
}
