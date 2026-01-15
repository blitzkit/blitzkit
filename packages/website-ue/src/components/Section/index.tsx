import type { ComponentProps } from "react";
import { classNames } from "../../core/ui/classNames";
import "./index.css";

export function Section({
  className,
  children,
  ...props
}: ComponentProps<"div">) {
  return (
    <div className={classNames("section", className)} {...props}>
      <div className="content">{children}</div>
    </div>
  );
}
