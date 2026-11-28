import type { EmbedPreviewControllerProps } from "../../pages/[...chunk_default]/[...locale]/embed/[embed]/_index";
import { EmbedState } from "../../stores/embedState";
import type { Radius } from "../../types/styles";
import { RangeSlider } from "./RangeSlider";

export function Radius({ configKey }: EmbedPreviewControllerProps) {
  return (
    <RangeSlider
      min={0}
      max={10}
      value={EmbedState.use((state) => {
        const radius = state[configKey] as Radius;
        return radius === "full" ? 10 : parseInt(radius);
      })}
      onValueChange={(value) => {
        EmbedState.mutate((draft) => {
          draft[configKey] = value === 10 ? "full" : `${value}`;
        });
      }}
    />
  );
}
