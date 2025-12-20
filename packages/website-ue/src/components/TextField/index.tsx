import type { ComponentProps } from "react";
import "./index.css";

export function TextField(props: ComponentProps<"input">) {
  return <input {...props} />;
}
