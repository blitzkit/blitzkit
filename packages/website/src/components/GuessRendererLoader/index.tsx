import { Spinner } from "../Spinner";
import styles from "./index.module.css";

export function GuessRendererLoader() {
  return (
    <div className={styles.loader}>
      <Spinner />
    </div>
  );
}
