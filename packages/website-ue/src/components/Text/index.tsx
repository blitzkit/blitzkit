import type { ComponentProps } from "react";
import { classNames } from "../../core/ui/classNames";
import type { ColorWithBW } from "../../core/ui/color";
import styles from "./index.module.css";

export interface TextProps extends ComponentProps<"span"> {
  weight?: "light" | "regular" | "medium" | "bold" | "black";
  lowContrast?: boolean;
  size?: "regular" | "minor" | "major";
  align?: "left" | "center" | "right";
  color?: ColorWithBW;
}

export function Text({
  lowContrast,
  className,
  size = "regular",
  weight,
  style,
  align,
  color = "gray",
  ...props
}: TextProps) {
  const scale = color === "gray" && lowContrast ? "white" : color;
  const isBW = color === "black" || color === "white";
  let power: string | number = isBW ? "a12" : 12;

  if (lowContrast) {
    power = color === "gray" ? "a9" : isBW ? "a11" : 11;
  }

  return (
    <span
      className={classNames(styles.text, className)}
      data-low-contrast={lowContrast}
      data-size={size}
      data-weight={weight}
      data-align={align === "left" ? undefined : align}
      style={{
        color: `var(--${scale}-${power})`,
      }}
      {...props}
    />
  );
}
