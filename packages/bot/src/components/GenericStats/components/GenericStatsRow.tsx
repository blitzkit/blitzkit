import { type GenericStat } from "..";
import { theme } from "../../../stitches.config";
import { PercentileIndicator } from "../../PercentileIndicator";

interface GenericStatsRowProps {
  stat: GenericStat;
}

export function GenericStatsRow({ stat }: GenericStatsRowProps) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
      }}
    >
      <span
        style={{
          color: theme.colors.textLowContrast,
          fontSize: 16,
          whiteSpace: "nowrap",
          maxWidth: 128,
          overflow: "hidden",
        }}
      >
        {stat[0]}
      </span>

      <span
        style={{
          color: theme.colors.textHighContrast,
          fontWeight: 700,
          fontSize: 16,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 4,
        }}
      >
        {stat[2] !== undefined && <PercentileIndicator percentile={stat[2]} />}
        {stat[1]}
      </span>
    </div>
  );
}
