import { alias } from "@blitzkit/core";
import { useProgress } from "@react-three/drei";
import { Tankopedia } from "../../stores/tankopedia";
import styles from "./index.module.css";

export function TankSandboxLoader() {
  const tank = Tankopedia.use((state) => state.protagonist.tank);
  const revealed = Tankopedia.use((state) => state.revealed);

  const data = useProgress();

  const isVisible = !revealed;

  return (
    <div className={styles.loader} data-visible={isVisible}>
      <img
        className={styles.icon}
        src={alias("api", `/tanks/${tank}/icons/big.webp`)}
      />
      <Progress value={data.progress} />
    </div>
  );
}

interface ProgressProps {
  value: number;
}

function Progress({ value }: ProgressProps) {
  return (
    <div className={styles.progress}>
      <div className={styles.bar} style={{ width: `${value}%` }} />
    </div>
  );
}
