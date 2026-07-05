import { Stats } from "@react-three/drei";
import { useRef } from "react";
import { settingsOrder } from "../../config/settings";
import { useSettingDeferred } from "../../hooks/useSetting";
import { Settings } from "../../stores/settings";
import { Code } from "../Code";
import styles from "./index.module.css";

const stats = [0, 1, 2];

export function RendererStats() {
  const renderStatistics = useSettingDeferred("render_statistics");

  if (!renderStatistics) return null;

  return <Inner />;
}

function Inner() {
  const parent = useRef<HTMLDivElement>(null!);
  const settings = Settings.use();

  return (
    <div className={styles.stats}>
      <div ref={parent} className={styles.graphs}>
        {stats.map((stat) => (
          <Stats parent={parent} showPanel={stat} className={styles.graph} />
        ))}
      </div>

      <div className={styles.settings}>
        {settingsOrder[0].settings.map((setting) => (
          <Code lowContrast size="minor">
            {setting} = {settings[setting]}
          </Code>
        ))}
      </div>
    </div>
  );
}
