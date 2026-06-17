import { createContext, useContext, useState, type ReactNode } from "react";
import styles from "./index.module.css";

const DialogContext = createContext<{
  open: boolean;
  setOpen: (open: boolean) => void;
} | null>(null);

function useDialog() {
  const context = useContext(DialogContext);

  if (context === null) {
    throw new Error("Dialog components must be used within a Dialog.Root");
  }

  return context;
}

interface RootProps {
  children: ReactNode;
}

function Root({ children }: RootProps) {
  const [open, setOpen] = useState(false);

  return (
    <DialogContext.Provider value={{ open, setOpen }}>
      {children}
    </DialogContext.Provider>
  );
}

interface TriggerProps {
  children: ReactNode;
}

function Trigger({ children }: TriggerProps) {
  const { setOpen } = useDialog();

  return (
    <div
      className={styles.trigger}
      onClick={() => {
        setOpen(true);
      }}
    >
      {children}
    </div>
  );
}

interface ContentProps {
  children: ReactNode;
}

function Content({ children }: ContentProps) {
  const { open, setOpen } = useDialog();

  if (!open) return null;

  return (
    <div
      className={styles.overlay}
      onClick={() => {
        setOpen(false);
      }}
    >
      <div
        className={styles.content}
        onClick={(event) => {
          event.stopPropagation();
        }}
      >
        {children}
      </div>
    </div>
  );
}

export const Dialog = { Root, Trigger, Content };
