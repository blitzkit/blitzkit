import { classNames } from "../../ui/classNames";
import { Text, type TextProps } from "../Text";
import styles from "./index.module.css";

export interface CodeProps extends TextProps {
  lowContrast?: boolean;
  variant?: "ghost" | "solid";
}

export function Code({ className, variant = "ghost", ...props }: CodeProps) {
  return (
    <Text
      data-variant={variant}
      className={classNames(styles.code, className)}
      {...props}
    />
  );
}
