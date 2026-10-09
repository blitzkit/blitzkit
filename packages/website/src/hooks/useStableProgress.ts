import { useProgress } from "@react-three/drei";
import { useRef } from "react";

export function useStableProgress() {
  const { loaded, total } = useProgress();
  const baseline = useRef(loaded);
  const progress = useRef(0);
  const pending = total - baseline.current;

  progress.current = Math.max(
    progress.current,
    pending <= 0 ? 0 : ((loaded - baseline.current) / pending) * 100
  );

  return progress.current;
}
