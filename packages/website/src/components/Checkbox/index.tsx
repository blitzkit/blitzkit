import { CheckIcon } from "@radix-ui/react-icons";
import { Checkbox as _Checkbox } from "radix-ui";
import { useId, type ReactNode } from "react";
import { Text } from "../Text";
import { composeRadixComponents } from "../../ui/compose";
import styles from "./index.module.css";

const _ = composeRadixComponents(_Checkbox, styles);

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
      <_.Root
        id={id}
        checked={checked}
        onCheckedChange={(value) => onCheckedChange(value === true)}
      >
        <_.Indicator>
          <CheckIcon />
        </_.Indicator>
      </_.Root>

      {children && (
        <label htmlFor={id}>
          <Text lowContrast>{children}</Text>
        </label>
      )}
    </div>
  );
}
