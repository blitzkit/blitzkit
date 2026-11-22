import { Select as _ } from "radix-ui";
import { composeRadixComponents } from "../../ui/compose";
import { Discriminator } from "../DropdownMenu";
import styles from "./index.module.css";

// TODO: for select, context menu, and dropdown menus, use scroller curtains
export const Select = {
  ...composeRadixComponents(_, styles, {
    Content: { position: "popper", align: "center" },
  }),
  Discriminator,
};
