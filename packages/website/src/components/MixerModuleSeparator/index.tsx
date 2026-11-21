import { CaretRightIcon } from "@radix-ui/react-icons";
import styles from "./index.module.css";

export function MixerModuleSeparator() {
  return (
    <span className={styles["mixer-module-separator"]}>
      <CaretRightIcon />
    </span>
  );
}
