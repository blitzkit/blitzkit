import type { CSSProperties } from "react";
import type { Radius, Space, SpaceWithout0, Weight } from "../../types/styles";

export interface EmbedRichText {
  color: string;
  size: SpaceWithout0;
  weight: Weight;
}

export function embedSpace(size: Space) {
  return `var(--space-${size})`;
}

export function embedRadius(radius: Radius) {
  if (radius === "full") return "var(--radius-max)";
  return embedSpace(radius);
}

export function embedText({ color, size, weight }: EmbedRichText) {
  return {
    color,
    fontSize: embedSpace(size),
    fontWeight: `var(--weight-${weight})`,
  } satisfies CSSProperties;
}
