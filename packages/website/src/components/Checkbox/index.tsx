import { useId, type ReactNode } from "react";
import { Text } from "../Text";
import styles from "./index.module.css";

export interface CheckboxProps {
  checked: boolean;
  onCheckedChange(checked: boolean): void;
  children?: ReactNode;
}

export function Checkbox({
  checked,
  onCheckedChange,
  children,
}: CheckboxProps) {
  const id = useId();

  return (
    <div className={styles.checkbox}>
      <input
        className={styles.control}
        type="checkbox"
        id={id}
        checked={checked}
        onChange={(event) => onCheckedChange(event.target.checked)}
      />

      {children && (
        <label htmlFor={id}>
          <Text lowContrast>{children}</Text>
        </label>
      )}
    </div>
  );
}
