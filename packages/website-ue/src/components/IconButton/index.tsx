import { classNames } from "../../core/ui/classNames";
import type { Color } from "../../core/ui/color";
import { Button, type ButtonProps } from "../Button";
import styles from "./index.module.css";

export interface IconButtonProps extends ButtonProps {
  color?: Color;
  variant?: "solid";
}

export function IconButton({ className, ...props }: ButtonProps) {
  return (
    <Button
      className={classNames(className, styles["icon-button"])}
      {...props}
    />
  );
}
