import { memo, useMemo } from "react";

const RESOLUTION = 1000;
const HEIGHT = 9;
const DENSE_TICKS = 100;

interface StatScaleProps {
  values: number[];
  value: number;
  lowerIsBetter?: boolean;
}

export const StatScale = memo<StatScaleProps>(
  ({ values, value, lowerIsBetter }) => {
    const ticks = useMemo(() => {
      const min = Math.min(value, ...values);
      const max = Math.max(value, ...values);
      const range = max - min;
      const counts = new Map<number, number>();

      for (const other of values) {
        const raw = range === 0 ? 0.5 : (other - min) / range;
        const x = Math.round((lowerIsBetter ? 1 - raw : raw) * RESOLUTION);

        if (x === 0 || x === RESOLUTION) continue;

        counts.set(x, (counts.get(x) ?? 0) + 1);
      }

      return Array.from(counts, ([x, count]) => ({
        x,
        color:
          count === 1
            ? "var(--gray-a5)"
            : count <= 3
              ? "var(--gray-a6)"
              : "var(--gray-a7)",
      }));
    }, [values, value, lowerIsBetter]);

    return (
      <div
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
      >
        {ticks.map(({ x, color }) => (
          <div
            key={x}
            style={{
              position: "absolute",
              top: 0,
              left: `${(x / RESOLUTION) * 100}%`,
              width: 1,
              height: "100%",
              backgroundColor: color,
            }}
          />
        ))}
      </div>
    );
  },
);
