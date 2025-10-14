import { type GenericStat } from "..";
import { GenericStatsRow } from "./GenericStatsRow";

interface GenericStatsColumnProps {
  stats: GenericStat[];
}

export function GenericStatsColumn({ stats }: GenericStatsColumnProps) {
  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 8 }}>
      {stats.map((stat) => (
        <GenericStatsRow key={stat[0]} stat={stat} />
      ))}
    </div>
  );
}
