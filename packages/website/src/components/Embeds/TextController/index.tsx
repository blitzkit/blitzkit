import type { EmbedPreviewControllerProps } from "../../../pages/[...chunk_default]/[...locale]/embed/[embed]/_index";
import { EmbedState } from "../../../stores/embedState";
import { TextField } from "../../TextField";
import styles from "./index.module.css";

export function TextController({ configKey }: EmbedPreviewControllerProps) {
  return (
    <TextField
      className={styles.field}
      placeholder="Empty"
      value={EmbedState.use((state) => state[configKey] as string)}
      onChange={(event) => {
        EmbedState.mutate((draft) => {
          draft[configKey] = (event.target as HTMLInputElement).value;
        });
      }}
    />
  );
}
