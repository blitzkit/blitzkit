import {
  CaretDownIcon,
  CaretSortIcon,
  CaretUpIcon,
} from "@radix-ui/react-icons";
import {
  useEffect,
  useRef,
  type ComponentProps,
  type CSSProperties,
} from "react";
import { Logo } from "../../icons/Logo";
import { SortDirection } from "../../stores/tankopediaPersistent";
import { CharacteristicRanking } from "../../types/characteristics";
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
        `${head.offsetHeight}px`,
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

function IconCorner({ children, ...props }: ComponentProps<"th">) {
  return (
    <Corner {...props}>
      <Logo className={styles.logo} />
      {children}
    </Corner>
  );
}

function ColumnHeader({ className, ...props }: ComponentProps<"th">) {
  return (
    <th className={classNames(styles["column-header"], className)} {...props} />
  );
}

interface ColumnHeaderSortableProps extends ComponentProps<"th"> {
  // Unsorted when undefined
  direction: SortDirection | undefined;
  onSort: () => void;
}

// The whole header toggles sorting, inheriting the header's font rather than a button's
function ColumnHeaderSortable({
  className,
  children,
  direction,
  onSort,
  ...props
}: ColumnHeaderSortableProps) {
  return (
    <th
      className={classNames(styles["column-header"], className)}
      onClick={onSort}
      data-sortable
      data-sorted={direction !== undefined}
      aria-sort={
        direction === undefined
          ? undefined
          : direction === SortDirection.Ascending
          ? "ascending"
          : "descending"
      }
      {...props}
    >
      {/* The cell stays a table cell, so its content lays out in here instead */}
      <span className={styles.sortable}>
        {children}

        {direction === undefined && <CaretSortIcon />}
        {direction === SortDirection.Ascending && <CaretUpIcon />}
        {direction === SortDirection.Descending && <CaretDownIcon />}
      </span>
    </th>
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

interface CellRankedProps extends CellProps {
  ranking: CharacteristicRanking | undefined;
  value: number | undefined;
  truth: number | undefined;
}

// Tints by how far the value strays from the truth, jade when better and red when worse
function CellRanked({
  ranking,
  value,
  truth,
  style,
  ...props
}: CellRankedProps) {
  const isRanked =
    ranking !== CharacteristicRanking.None &&
    value !== undefined &&
    truth !== undefined &&
    value !== truth &&
    Number.isFinite(value) &&
    Number.isFinite(truth);

  if (!isRanked) return <Cell style={style} {...props} />;

  const higherIsBetter = ranking !== CharacteristicRanking.LowerIsBetter;
  const better = higherIsBetter === value > truth;
  const change = truth === 0 ? 1 : Math.abs(value / truth - 1);
  const intensity = Math.round(Math.min(100, change * 2 * 100 + 25));

  return (
    <Cell
      data-delta={better ? "better" : "worse"}
      style={{ "--intensity": `${intensity}%`, ...style } as CSSProperties}
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
  IconCorner,
  ColumnHeader,
  ColumnHeaderSortable,
  RowHeader,
  GroupTitle,
  GroupCell,
  Cell,
  CellRanked,
};
