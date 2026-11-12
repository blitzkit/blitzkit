import { Canvas, type CanvasProps } from "@react-three/fiber";
import { useRef } from "react";
import { useOnScreen } from "../../hooks/useOnScreen";
import styles from "./index.module.css";

export function SmartCanvas({ className, ...props }: CanvasProps) {
  const canvas = useRef<HTMLCanvasElement>(null!);
  const onScreen = useOnScreen(canvas);

  return (
    <div className={className}>
      <div className={styles.canvas}>
        <Canvas
          frameloop={onScreen ? "demand" : "never"}
          ref={canvas}
          {...props}
        />
      </div>
    </div>
  );
}
