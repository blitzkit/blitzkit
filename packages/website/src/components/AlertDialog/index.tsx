import { AlertDialog as _ } from "radix-ui";
import type { ComponentProps } from "react";
import { classNames } from "../../ui/classNames";
import { composeRadixComponents } from "../../ui/compose";
import styles from "./index.module.css";

function Actions({ className, ...props }: ComponentProps<"div">) {
  return <div className={classNames(styles.actions, className)} {...props} />;
}

export const AlertDialog = { ...composeRadixComponents(_, styles), Actions };
