import { memo, useEffect, useMemo, useRef } from "react";

const RESOLUTION = 1000;
const HEIGHT = 8;
const DENSE_TICKS = 100;

interface StatScaleProps {
  values: number[];
  value: number;
  lowerIsBetter?: boolean;
}

export const StatScale = memo<StatScaleProps>(
  ({ values, value, lowerIsBetter }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const ticks = useMemo(() => {
      const min = Math.min(value, ...values);
      const max = Math.max(value, ...values);
      const range = max - min;
      const positions = new Set<number>();

      for (const other of values) {
        const raw = range === 0 ? 0.5 : (other - min) / range;
        const x = Math.round((lowerIsBetter ? 1 - raw : raw) * RESOLUTION);

        if (x === 0 || x === RESOLUTION) continue;

        positions.add(x);
      }

      return Array.from(positions, (x) => ({ x }));
    }, [values, value, lowerIsBetter]);

    useEffect(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const draw = () => {
        const { width } = canvas.getBoundingClientRect();
        const pixelRatio = window.devicePixelRatio || 1;
        const canvasWidth = Math.ceil(width * pixelRatio);
        const canvasHeight = Math.ceil(HEIGHT * pixelRatio);

        if (canvas.width !== canvasWidth || canvas.height !== canvasHeight) {
          canvas.width = canvasWidth;
          canvas.height = canvasHeight;
        }

        const context = canvas.getContext("2d");
        if (!context) return;

        context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
        context.clearRect(0, 0, width, HEIGHT);

        const styles = getComputedStyle(canvas);
        for (const { x } of ticks) {
          context.fillStyle = styles.getPropertyValue("--gray-a6").trim();
          context.fillRect((x / RESOLUTION) * width, 0, 1, HEIGHT);
        }
      };

      const observer = new ResizeObserver(draw);
      observer.observe(canvas);
      window.addEventListener("resize", draw);
      draw();

      return () => {
        observer.disconnect();
        window.removeEventListener("resize", draw);
      };
    }, [ticks]);

    return (
      <canvas
        ref={canvasRef}
        aria-hidden="true"
        style={{
          position: "absolute",
          top: 0,
          bottom: 0,
          left: 0,
          width: "100%",
          height: HEIGHT,
          margin: "auto 0",
          opacity: Math.min(1, Math.sqrt(DENSE_TICKS / ticks.length)),
          pointerEvents: "none",
        }}
      />
    );
  },
);
