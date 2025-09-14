import { useProgress } from "@react-three/drei";
import { useRef } from "react";

export function useStableProgress() {
  const { loaded, total } = useProgress();
  const progress = useRef(0);

  progress.current = Math.max(
    progress.current,
    total === 0 ? 0 : (loaded / total) * 100
  );

  return progress.current;
}
