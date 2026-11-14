import type { ComponentProps } from "react";
import { classNames } from "../../ui/classNames";
import type { ColorWithBW } from "../../ui/color";
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
  let power = color === "gray" ? "12" : "11";

  if (lowContrast) {
    power = "5";

    if (color === "gray") {
      power = "a9";
    }

    if (isBW) {
      power = "a11";
    }
  }

  return (
    <span
      className={classNames(styles.text, className)}
      data-low-contrast={lowContrast}
      data-size={size}
      data-weight={weight}
      data-align={align === "left" ? undefined : align}
      style={{ color: `var(--${scale}-${power})` }}
      {...props}
    />
  );
}
