import { BKNI_COLORS, BkniPercentile, getBkniPercentile } from "../statistics";

export function parseBkni(bkni: number) {
  const bkniFraction = (bkni + 1) / 2;
  const bkniMetric = Math.round(bkniFraction * 200);
  const bkniPercentile = getBkniPercentile(bkniMetric);
  const lastBkniPercentile = Math.max(0, bkniPercentile - 1) as BkniPercentile;
  const bkniColor = BKNI_COLORS[bkniPercentile];
  const lastBkniColor = BKNI_COLORS[lastBkniPercentile];

  return {
    bkni,
    bkniFraction,
    bkniMetric,
    bkniPercentile,
    lastBkniPercentile,
    bkniColor,
    lastBkniColor,
  };
}
