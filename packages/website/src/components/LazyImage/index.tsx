import type { ComponentProps } from "react";

export function LazyImage(props: ComponentProps<"img">) {
  return <img {...props} loading="lazy" />;
}
