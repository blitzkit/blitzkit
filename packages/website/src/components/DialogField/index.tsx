import type { ComponentProps, ReactNode } from "react";
import { classNames } from "../../ui/classNames";
import { Text } from "../Text";
import styles from "./index.module.css";

interface DialogFieldProps extends ComponentProps<"div"> {
  label: ReactNode;
}

// Stacks a label over the control it names
// TODO: figoure out the semantics of this
export function DialogField({
  className,
  label,
  children,
  ...props
}: DialogFieldProps) {
  return (
    <div className={classNames(styles.field, className)} {...props}>
      <Text lowContrast>{label}</Text>
      {children}
    </div>
  );
}
