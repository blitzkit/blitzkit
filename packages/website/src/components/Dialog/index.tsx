import { Dialog as _ } from "radix-ui";
import type { ComponentProps } from "react";
import { classNames } from "../../ui/classNames";
import { composeRadixComponents } from "../../ui/compose";
import { Scroller, ScrollerOrientation } from "../Scroller";
import styles from "./index.module.css";

// Groups a title and description
function Header({ className, ...props }: ComponentProps<"div">) {
  return <div className={classNames(styles.header, className)} {...props} />;
}

// Scrolls the content that follows the header
function Body({
  className,
  children,
  ...props
}: ComponentProps<typeof Scroller>) {
  return (
    <Scroller
      orientation={ScrollerOrientation.Vertical}
      className={classNames(styles.body, className)}
      {...props}
    >
      <div className={styles.content}>{children}</div>
    </Scroller>
  );
}

export const Dialog = { ...composeRadixComponents(_, styles), Header, Body };
