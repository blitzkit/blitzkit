import { classNames } from "../../core/ui/classNames";
import { Button, type ButtonProps } from "../Button";
import styles from "./index.module.css";

export function IconButton({ className, ...props }: ButtonProps) {
  return (
    <Button
      className={classNames(className, styles["icon-button"])}
      {...props}
    />
  );
}
