import { Select as _ } from "radix-ui";
import type { ComponentProps } from "react";
import { classNames } from "../../ui/classNames";
import { composeRadixComponents } from "../../ui/compose";
import { Button } from "../Button";
import { Discriminator } from "../DropdownMenu";
import styles from "./index.module.css";

type SelectTriggerProps = ComponentProps<typeof _.Trigger>;

function Trigger({ className, children, ...props }: SelectTriggerProps) {
  return (
    <_.Trigger asChild {...props}>
      <Button
        variant="outline"
        color="gray"
        className={classNames(styles.Trigger, className)}
      >
        {children}
      </Button>
    </_.Trigger>
  );
}

// TODO: for select, context menu, and dropdown menus, use scroller curtains
export const Select = {
  ...composeRadixComponents(_, styles, {
    Content: { position: "popper", align: "center" },
  }),

  Discriminator,
  Trigger,
};
