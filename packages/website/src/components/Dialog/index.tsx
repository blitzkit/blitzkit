import { Dialog as _ } from "radix-ui";
import { composeRadixComponents } from "../../ui/compose";
import { DialogActions } from "../DialogActions";
import { DialogBody } from "../DialogBody";
import { DialogField } from "../DialogField";
import { DialogHeader } from "../DialogHeader";
import styles from "./index.module.css";

// The extra parts live in their own components, shared by every dialog-like surface
export const Dialog = {
  ...composeRadixComponents(_, styles),

  Header: DialogHeader,
  Body: DialogBody,
  Actions: DialogActions,
  Field: DialogField,
};
