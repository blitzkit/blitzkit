import { AlertDialog as _ } from "radix-ui";
import { composeRadixComponents } from "../../ui/compose";
import { DialogActions } from "../DialogActions";
import { DialogBody } from "../DialogBody";
import { DialogField } from "../DialogField";
import { DialogHeader } from "../DialogHeader";
import styles from "./index.module.css";

// TODO: figoure out tree shaking for these kinds of wrapped components
// The extra parts live in their own components, shared by every dialog-like surface
export const AlertDialog = {
  ...composeRadixComponents(_, styles),

  Header: DialogHeader,
  Body: DialogBody,
  Actions: DialogActions,
  Field: DialogField,
};
