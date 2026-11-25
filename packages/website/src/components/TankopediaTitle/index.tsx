import { useDuelModules } from "../../hooks/useDuelModules";
import { useUnwrapper } from "../../hooks/useUnwrapper";
import { Heading } from "../Heading";
import styles from "./index.module.css";

export function TankopediaTitle() {
  const unwrap = useUnwrapper();

  const protagonist = useDuelModules("protagonist");

  return (
    <div
      className={styles.wrapper}
      style={{
        backgroundImage: `url(/media/national-wallpapers/${protagonist.tank.nation}.jpg)`,
      }}
    >
      <div className={styles.content}>
        <Heading size="3">{unwrap(protagonist.tank.name)}</Heading>
      </div>
    </div>
  );
}
