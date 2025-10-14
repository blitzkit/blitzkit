import { type ReactNode } from "react";

interface RowProps {
  children: ReactNode;
}

export function Row({ children }: RowProps) {
  return (
    <div
      style={{
        display: "flex",
        gap: 8,
      }}
    >
      {children}
    </div>
  );
}
