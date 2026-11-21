import type { EmbedPreviewControllerProps } from "../../pages/[...chunk_default]/[...locale]/embed/[embed]/_index";
import { EmbedState } from "../../stores/embedState";
import type { Space } from "../../types/styles";
import { RangeSlider } from "./RangeSlider";

export function Size({ configKey }: EmbedPreviewControllerProps) {
  return (
    <RangeSlider
      min={0}
      max={9}
      value={EmbedState.use((state) => parseInt(state[configKey] as Space))}
      onValueChange={(value) => {
        EmbedState.mutate((draft) => {
          draft[configKey] = `${value}`;
        });
      }}
    />
  );
}
