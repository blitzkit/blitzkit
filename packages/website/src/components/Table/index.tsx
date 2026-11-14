import { useEffect, useRef, type ComponentProps } from "react";
import { classNames } from "../../ui/classNames";
import { Scroller, ScrollerOrientation } from "../Scroller";
import styles from "./index.module.css";

interface RootProps
  extends Omit<ComponentProps<typeof Scroller>, "orientation"> {
  scrollable?: boolean;
}

// When scrollable, scrolls both ways, keeping the head, the row headers and the group titles in view
function Root({ children, className, scrollable, ...props }: RootProps) {
  const table = useRef<HTMLTableElement>(null);

  // Group titles stick right below the head, whatever its height
  useEffect(() => {
    const head = table.current!.tHead;

    if (!head) return;

    const observer = new ResizeObserver(() => {
      table.current!.style.setProperty(
        "--head-height",
        `${head.offsetHeight}px`
      );
    });

    observer.observe(head);

    return () => observer.disconnect();
  }, []);

  const content = (
    <table ref={table} className={styles.table}>
      {children}
    </table>
  );

  if (!scrollable) {
    return (
      <div className={classNames(styles.scroller, className)} {...props}>
        {content}
      </div>
    );
  }

  return (
    <Scroller
      orientation={ScrollerOrientation.Both}
      startCurtain={false}
      className={classNames(styles.scroller, className)}
      {...props}
    >
      {content}
    </Scroller>
  );
}

function Head(props: ComponentProps<"thead">) {
  return <thead {...props} />;
}

function Body(props: ComponentProps<"tbody">) {
  return <tbody {...props} />;
}

function Row(props: ComponentProps<"tr">) {
  return <tr {...props} />;
}

// Sits where the head and the row headers meet
function Corner({ className, ...props }: ComponentProps<"th">) {
  return (
    <th
      className={classNames(styles["column-header"], styles.corner, className)}
      {...props}
    />
  );
}

function ColumnHeader({ className, ...props }: ComponentProps<"th">) {
  return (
    <th className={classNames(styles["column-header"], className)} {...props} />
  );
}

function RowHeader({ className, ...props }: ComponentProps<"th">) {
  return (
    <th className={classNames(styles["row-header"], className)} {...props} />
  );
}

// A title that spans columns pins its content instead of sliding away
function GroupTitle({ className, children, ...props }: ComponentProps<"th">) {
  return (
    <th className={classNames(styles["group-title"], className)} {...props}>
      {props.colSpan === undefined ? (
        children
      ) : (
        <div className={styles.pinned}>{children}</div>
      )}
    </th>
  );
}

// Shares the group title's row
function GroupCell({ className, ...props }: ComponentProps<"td">) {
  return (
    <td className={classNames(styles["group-cell"], className)} {...props} />
  );
}

interface CellProps extends Omit<ComponentProps<"td">, "align"> {
  align?: "start" | "center" | "end";
}

function Cell({ className, align, ...props }: CellProps) {
  return (
    <td
      className={classNames(styles.cell, className)}
      data-align={align}
      {...props}
    />
  );
}

export const Table = {
  Root,
  Head,
  Body,
  Row,
  Corner,
  ColumnHeader,
  RowHeader,
  GroupTitle,
  GroupCell,
  Cell,
};
