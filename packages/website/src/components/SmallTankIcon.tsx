interface SmallTankIconProps {
  id: number;
  size?: number;
}

const WIDTH = 70;
const HEIGHT = 24;

export function SmallTankIcon({ id, size = HEIGHT }: SmallTankIconProps) {
  return (
    <div
      style={{
        height: size,
        overflow: "hidden",
        width: WIDTH * (size / HEIGHT),
      }}
    >
      <img
        alt={`Tank ${id}`}
        src={`/tanks/${id}/icons/small.webp`}
        style={{
          transform: `scale(${(size / HEIGHT) * 100}%)`,
          transformOrigin: "top left",
        }}
      />
    </div>
  );
}
