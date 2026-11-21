import { Html } from "@react-three/drei";
import { useStableProgress } from "../../hooks/useStableProgress";
import { Progress } from "../Progress";
import styles from "./index.module.css";

export function MixerFallback() {
  const progress = useStableProgress();

  return (
    <Html center>
      <Progress className={styles.progress} value={progress} />
    </Html>
  );
}
