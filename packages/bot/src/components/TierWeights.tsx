import type { TierWeightsRecord } from "@blitzkit/core";
import { theme } from "../stitches.config";

interface TierWeightsProps {
  weights: TierWeightsRecord;
}

export function TierWeights({ weights }: TierWeightsProps) {
  return (
    <div style={{ display: "flex", gap: 8 }}>
      {Object.entries(weights).map(([tier, weight]) => (
        <div
          key={tier}
          style={{
            backgroundColor: theme.colors.appBackground1_light,
            flex: weight,
            color: theme.colors.textHighContrast_light,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 16,
            overflow: "hidden",
            borderRadius: 8,
            minWidth: 16,
          }}
        >
          {tier}
        </div>
      ))}
    </div>
  );
}
