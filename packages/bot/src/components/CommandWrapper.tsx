import { type ReactNode } from "react";
import { theme } from "../stitches.config";

interface CommandWrapperProps {
  children: ReactNode;
  fat?: boolean;
}

export function CommandWrapper({ children, fat }: CommandWrapperProps) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        padding: `16px ${fat ? 0 : 16}px`,
        gap: 16,
        width: "100%",
        color: theme.colors.textHighContrast,
        backgroundColor: theme.colors.appBackground1,
        position: "relative",
      }}
    >
      {children}
    </div>
  );
}
