import type { EmbedPreviewControllerProps } from "../../pages/[...chunk_default]/[...locale]/embed/[embed]/_index";
import { EmbedState } from "../../stores/embedState";
import type {
  EmbedConfigItemType,
  EmbedItemType,
} from "../../stores/embedState/constants";
import { RangeSlider } from "./RangeSlider";

export function Slider({
  configKey,
  config,
}: EmbedPreviewControllerProps & {
  config: EmbedConfigItemType<EmbedItemType.Slider>;
}) {
  return (
    <RangeSlider
      min={config.min}
      max={config.max}
      value={EmbedState.use((state) => Number(state[configKey]))}
      onValueChange={(value) => {
        EmbedState.mutate((draft) => {
          draft[configKey] = value;
        });
      }}
    />
  );
}
