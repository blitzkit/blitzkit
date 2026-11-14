import { useEffect, useRef } from "react";
import { insertionMarkers } from "./constants";
import styles from "./index.module.css";

interface CompareInsertionMarkerProps {
  index: number;
}

export function CompareInsertionMarker({ index }: CompareInsertionMarkerProps) {
  const marker = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = marker.current!;
    const insertionMarker = { element, index };

    insertionMarkers.add(insertionMarker);

    return () => {
      insertionMarkers.delete(insertionMarker);
    };
  }, [index]);

  return <div ref={marker} className={styles.marker} />;
}
