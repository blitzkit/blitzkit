import type { ComponentProps } from "react";
import { classNames } from "../../ui/classNames";
import type { ButtonProps } from "../Button";
import { IconButton } from "../IconButton";
import styles from "./index.module.css";

type SidebarIconButtonProps = ButtonProps & {
  selected: boolean;
  src: string;
  alt: string;
};

export function SidebarIconGroup({
  className,
  ...props
}: ComponentProps<"div">) {
  return (
    <div
      className={classNames(styles["sidebar-icon-group"], className)}
      {...props}
    />
  );
}

// TODO: sunset this
export function SidebarIconButton({
  selected,
  src,
  alt,
  ...props
}: SidebarIconButtonProps) {
  return (
    <IconButton
      parentListChild="vertical"
      color={selected ? undefined : "gray"}
      variant="soft"
      size="major"
      {...props}
    >
      <img alt={alt} src={src} />
    </IconButton>
  );
}
