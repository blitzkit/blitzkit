import { Dialog as _ } from "radix-ui";
import type { ComponentProps } from "react";
import { classNames } from "../../ui/classNames";
import { composeRadixComponents } from "../../ui/compose";
import styles from "./index.module.css";

// Groups a title and description
function Header({ className, ...props }: ComponentProps<"div">) {
  return <div className={classNames(styles.header, className)} {...props} />;
}

// Stacks the content that follows the header
function Body({ className, ...props }: ComponentProps<"div">) {
  return <div className={classNames(styles.body, className)} {...props} />;
}

export const Dialog = { ...composeRadixComponents(_, styles), Header, Body };
