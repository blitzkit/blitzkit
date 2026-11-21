import type { ReactNode } from "react";

interface Props {
  children: ReactNode;
}

// TODO: implement callout
export function Callout({ children }: Props) {
  return <div>{children}</div>;
}
