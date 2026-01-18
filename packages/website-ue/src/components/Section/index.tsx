import type { ComponentProps } from "react";
import { classNames } from "../../core/ui/classNames";
import "./index.css";

export interface SectionProps extends ComponentProps<"div"> {
  first?: boolean;
}

export function Section({ className, children, ...props }: SectionProps) {
  return (
    <div
      data-first={props.first}
      className={classNames("section", className)}
      {...props}
    >
      <div className="content">{children}</div>
    </div>
  );
}
