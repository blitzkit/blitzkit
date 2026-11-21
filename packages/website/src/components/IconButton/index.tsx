import { classNames } from "../../ui/classNames";
import { Button, type ButtonProps } from "../Button";
import styles from "./index.module.css";

export function IconButton({ className, ...props }: ButtonProps) {
  return (
    <Button
      evenPadding
      className={classNames(className, styles["icon-button"])}
      {...props}
    />
  );
}
