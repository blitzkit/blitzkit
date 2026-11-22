import { ContextMenu as _ } from "radix-ui";
import { composeRadixComponents } from "../../ui/compose";
import { Discriminator } from "../DropdownMenu";
import styles from "./index.module.css";

export const ContextMenu = {
  ...composeRadixComponents(_, styles),
  Discriminator,
};
