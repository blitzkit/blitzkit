import { type ComponentProps } from "react";

export interface GlowProps extends ComponentProps<"div"> {
  color: string;
  direction?: "default" | "reverse";
  rotation?: number;
  startOpacity?: number;
  endOpacity?: number;
}

const width = 16;

export function Glow({
  color,
  direction = "default",
  rotation = 0,
  style,
  startOpacity = 0,
  endOpacity = 1,
  ...props
}: GlowProps) {
  const color1 = `${color}${Math.round(endOpacity * 255)
    .toString(16)
    .padStart(2, "0")}`;
  const color2 = `${color}${Math.round(startOpacity * 255)
    .toString(16)
    .padStart(2, "0")}`;
  const background = `linear-gradient(${
    direction === "default" ? 0 : 180
  }deg, ${color1} 0%, ${color2} 100%)`;

  return (
    <div
      style={{
        display: "flex",
        alignItems: direction === "default" ? "flex-end" : "flex-start",
        justifyContent: "center",
        transform: `rotate(${rotation}deg)`,
        ...style,
      }}
      {...props}
    >
      <div style={{ height: 54, width, background }} />
      <div style={{ height: 72, width, background }} />
      <div style={{ height: 80, width, background }} />
      <div style={{ height: 72, width, background }} />
      <div style={{ height: 54, width, background }} />
    </div>
  );
}
