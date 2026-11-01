import { memo, useEffect, useMemo, useRef } from "react";

const HEIGHT = 9;
const DENSE_TICKS = 100;

interface StatScaleProps {
  values: number[];
  value: number;
  lowerIsBetter?: boolean;
}

export const StatScale = memo<StatScaleProps>(
  ({ values, value, lowerIsBetter }) => {
    const canvas = useRef<HTMLCanvasElement>(null);
    const ticks = useMemo(() => {
      const min = Math.min(value, ...values);
      const max = Math.max(value, ...values);
      const range = max - min;
      const counts = new Map<number, number>();

      for (const other of values) {
        const raw = range === 0 ? 0.5 : (other - min) / range;
        const x = lowerIsBetter ? 1 - raw : raw;

        if (x === 0 || x === 1) continue;

        counts.set(x, (counts.get(x) ?? 0) + 1);
      }

      return Array.from(counts, ([x, count]) => ({
        x,
        color:
          count === 1 ? "--gray-a5" : count <= 3 ? "--gray-a6" : "--gray-a7",
      }));
    }, [values, value, lowerIsBetter]);

    useEffect(() => {
      const element = canvas.current;
      if (!element) return;

      const draw = () => {
        const { width } = element.getBoundingClientRect();
        const pixelRatio = window.devicePixelRatio || 1;
        const context = element.getContext("2d");
        if (!context) return;

        element.width = Math.round(width * pixelRatio);
        element.height = Math.round(HEIGHT * pixelRatio);
        context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);

        const styles = getComputedStyle(element);
        for (const { x, color } of ticks) {
          context.fillStyle = styles.getPropertyValue(color);
          context.fillRect(x * width, 0, 1, HEIGHT);
        }
      };

      const observer = new ResizeObserver(draw);
      observer.observe(element);
      draw();

      return () => observer.disconnect();
    }, [ticks]);

    return (
      <canvas
        ref={canvas}
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
