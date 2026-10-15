import { type ReactNode } from "react";
import styles from "./index.module.css";

export interface SegmentedControlOption {
  value: string;
  label: ReactNode;
}

export interface SegmentedControlProps {
  options: readonly SegmentedControlOption[];
  value: string;
  onValueChange(value: string): void;
  size?: "regular" | "minor";
  variant?: "solid" | "underline";
}

export function SegmentedControl({
  options,
  value,
  onValueChange,
  size = "regular",
  variant = "solid",
}: SegmentedControlProps) {
  const selectedIndex = options.findIndex((option) => option.value === value);
  const segmentWidth = 100 / options.length;

  return (
    <div
      className={styles.options}
      role="radiogroup"
      data-size={size}
      data-variant={variant}
      style={{
        gridTemplateColumns: `repeat(${options.length}, minmax(0, 1fr))`,
      }}
    >
      <div
        className={styles.indicator}
        style={{
          left: `${Math.max(selectedIndex, 0) * segmentWidth}%`,
          width: `${segmentWidth}%`,
        }}
        aria-hidden="true"
      />

      {options.map((option) => (
        <label className={styles.option} key={option.value}>
          <input
            type="radio"
            value={option.value}
            checked={option.value === value}
            onChange={() => onValueChange(option.value)}
          />
          <span className={styles.label}>{option.label}</span>
        </label>
      ))}
    </div>
  );
}
