import { Switch as _Switch } from "radix-ui";
import { composeRadixComponents } from "../../ui/compose";
import styles from "./index.module.css";

const _ = composeRadixComponents(_Switch, styles);

export interface SwitchProps {
  checked: boolean;
  onCheckedChange(checked: boolean): void;
  disabled?: boolean;
}

export function Switch({ checked, onCheckedChange, disabled }: SwitchProps) {
  return (
    <_.Root
      checked={checked}
      onCheckedChange={onCheckedChange}
      disabled={disabled}
    >
      <_.Thumb />
    </_.Root>
  );
}
