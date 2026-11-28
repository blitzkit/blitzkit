import type { Ref } from "react";
import styles from "./index.module.css";

interface InsertionMarkerProps {
  ref: Ref<HTMLDivElement>;
}

// One shared bar, positioned by whatever is being dragged since only it knows where it would land
export function InsertionMarker({ ref }: InsertionMarkerProps) {
  return (
    <div ref={ref} className={styles.marker}>
      <div className={styles.bar} />
    </div>
  );
}
