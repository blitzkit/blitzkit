import { FontBoldIcon, FontSizeIcon } from "@radix-ui/react-icons";
import type { EmbedPreviewControllerProps } from "../../../pages/[...chunk_default]/[...locale]/embed/[embed]/_index";
import { weights } from "../../../config/styles";
import { EmbedState } from "../../../stores/embedState";
import type {
  EmbedConfigItemType,
  EmbedItemType,
} from "../../../stores/embedState/constants";
import type { SpaceWithout0, Weight } from "../../../types/styles";
import { ColorControllerRaw } from "../ColorControllerRaw";
import { RangeSlider } from "../RangeSlider";
import styles from "./index.module.css";

const weightNames = Object.keys(weights) as Weight[];

type RichTextState = EmbedConfigItemType<EmbedItemType.RichText>["default"];

export function RichText({ configKey }: EmbedPreviewControllerProps) {
  const state = EmbedState.use((state) => state[configKey] as RichTextState);

  return (
    <div className={styles["rich-text"]}>
      <div className={styles.row}>
        <ColorControllerRaw
          value={state.color}
          onValueChange={(value) => {
            EmbedState.mutate((draft) => {
              (draft[configKey] as RichTextState).color = value;
            });
          }}
        />
      </div>

      <div className={styles.row} data-padded>
        <FontSizeIcon className={styles.icon} />
        <RangeSlider
          min={1}
          max={9}
          value={Number(state.size)}
          onValueChange={(value) => {
            EmbedState.mutate((draft) => {
              (draft[configKey] as RichTextState).size =
                `${value}` as SpaceWithout0;
            });
          }}
        />
      </div>

      <div className={styles.row} data-padded>
        <FontBoldIcon className={styles.icon} />
        <RangeSlider
          min={0}
          max={weightNames.length - 1}
          value={weightNames.indexOf(state.weight)}
          onValueChange={(value) => {
            EmbedState.mutate((draft) => {
              (draft[configKey] as RichTextState).weight =
                weightNames[value];
            });
          }}
        />
      </div>
    </div>
  );
}
