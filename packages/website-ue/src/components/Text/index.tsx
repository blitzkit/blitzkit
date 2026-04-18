import type { ComponentProps } from "react";
import { classNames } from "../../core/ui/classNames";
import type { Color } from "../../core/ui/color";
import styles from "./index.module.css";

export interface TextProps extends ComponentProps<"span"> {
  weight?: "light" | "regular" | "medium" | "bold" | "black";
  lowContrast?: boolean;
  size?: "regular" | "minor" | "major";
  align?: "left" | "center" | "right";
  color?: Color;
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
  let power: string | number = 12;

  if (lowContrast) {
    power = color === "gray" ? "a9" : 11;
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
