import { memo, useMemo } from "react";

const RESOLUTION = 1000;
const HEIGHT = 9;

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

      const single: string[] = [];
      const few: string[] = [];
      const many: string[] = [];

      counts.forEach((count, x) => {
        const segment = `M${x} 0V${HEIGHT}`;

        if (count === 1) single.push(segment);
        else if (count <= 3) few.push(segment);
        else many.push(segment);
      });

      return {
        single: single.join(""),
        few: few.join(""),
        many: many.join(""),
      };
    }, [values, value, lowerIsBetter]);

    return (
      <svg
        viewBox={`0 0 ${RESOLUTION} ${HEIGHT}`}
        preserveAspectRatio="none"
        style={{
          position: "absolute",
          top: "50%",
          left: 0,
          width: "100%",
          height: HEIGHT,
          transform: "translateY(-50%)",
          overflow: "visible",
          pointerEvents: "none",
        }}
      >
        <path
          d={ticks.single}
          stroke="var(--gray-a4)"
          strokeWidth="1"
          vectorEffect="non-scaling-stroke"
        />
        <path
          d={ticks.few}
          stroke="var(--gray-a5)"
          strokeWidth="1"
          vectorEffect="non-scaling-stroke"
        />
        <path
          d={ticks.many}
          stroke="var(--gray-a6)"
          strokeWidth="1"
          vectorEffect="non-scaling-stroke"
        />
      </svg>
    );
  },
);
