import { Box } from "@radix-ui/themes";
import { memo, useMemo } from "react";

const RESOLUTION = 1000;
const HEIGHT = 21;
const BASE_TICK_LENGTH = 7;
const TICK_INSET = (HEIGHT - BASE_TICK_LENGTH * 1.25) / 2;
const END_TICK_INSET = (HEIGHT - BASE_TICK_LENGTH * 1.5) / 2;

export type StatScaleColor = "red" | "orange" | "yellow" | "green";

interface StatScaleProps {
  values: number[];
  value: number;
  lowerIsBetter?: boolean;
  color: StatScaleColor;
}

export const StatScale = memo<StatScaleProps>(
  ({ values, value, lowerIsBetter, color }) => {
    const { position, ticks } = useMemo(() => {
      const min = Math.min(value, ...values);
      const max = Math.max(value, ...values);
      const range = max - min;

      function place(x: number) {
        const raw = range === 0 ? 0.5 : (x - min) / range;
        return lowerIsBetter ? 1 - raw : raw;
      }

      const counts = new Map<number, number>();

      for (const other of values) {
        const x = Math.round(place(other) * RESOLUTION);
        counts.set(x, (counts.get(x) ?? 0) + 1);
      }

      const single: string[] = [];
      const few: string[] = [];
      const many: string[] = [];
      const ends: string[] = [];

      counts.forEach((count, x) => {
        const segment = `M${x} ${TICK_INSET}V${HEIGHT - TICK_INSET}`;

        if (x === 0 || x === RESOLUTION) {
          ends.push(`M${x} ${END_TICK_INSET}V${HEIGHT - END_TICK_INSET}`);
        } else if (count === 1) single.push(segment);
        else if (count <= 3) few.push(segment);
        else many.push(segment);
      });

      return {
        position: place(value),
        ticks: {
          single: single.join(""),
          few: few.join(""),
          many: many.join(""),
          ends: ends.join(""),
        },
      };
    }, [values, value, lowerIsBetter]);

    return (
      <Box position="relative" width="100%" style={{ height: HEIGHT }}>
        <Box
          position="absolute"
          left="0"
          width="100%"
          style={{
            top: "50%",
            height: 1,
            transform: "translateY(-50%)",
            background: "var(--gray-a9)",
          }}
        />

        <svg
          viewBox={`0 0 ${RESOLUTION} ${HEIGHT}`}
          preserveAspectRatio="none"
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            overflow: "visible",
          }}
        >
          <path
            d={ticks.single}
            stroke="var(--gray-a6)"
            strokeWidth="1"
            vectorEffect="non-scaling-stroke"
          />
          <path
            d={ticks.few}
            stroke="var(--gray-a8)"
            strokeWidth="1"
            vectorEffect="non-scaling-stroke"
          />
          <path
            d={ticks.many}
            stroke="var(--gray-a9)"
            strokeWidth="1"
            vectorEffect="non-scaling-stroke"
          />
          <path
            d={ticks.ends}
            stroke="var(--gray-a9)"
            strokeWidth="1"
            vectorEffect="non-scaling-stroke"
          />
        </svg>

        <Box
          position="absolute"
          left="0"
          style={{
            top: "50%",
            width: `${position * 100}%`,
            height: 3,
            transform: "translateY(-50%)",
            background: `var(--${color}-9)`,
            opacity: 0.9,
          }}
        />

        <Box
          position="absolute"
          style={{
            top: 0,
            left: `${position * 100}%`,
            width: 2,
            height: HEIGHT,
            transform: "translateX(-50%)",
            borderRadius: 1,
            background: "color-mix(in srgb, var(--violet-9) 50%, black)",
            boxShadow: "0 0 0 1px var(--color-background)",
          }}
        />
      </Box>
    );
  },
);
