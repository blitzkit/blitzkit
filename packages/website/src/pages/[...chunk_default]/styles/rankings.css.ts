import { RANKING_COLORS, RANKING_STEPS } from "../../../config/rankings";

export { getStaticPaths } from "../_index";

const SEGMENTS = RANKING_COLORS.length - 1;

// Exposes the progress and blended color of each step to anything ranked
function stepStyles(step: number) {
  const progress = step / RANKING_STEPS;
  const position = progress * SEGMENTS;
  const segment = Math.min(Math.floor(position), SEGMENTS);
  const from = RANKING_COLORS[segment];
  const to = RANKING_COLORS[Math.min(segment + 1, SEGMENTS)];
  const weight = (1 - (position - segment)) * 100;

  return `[data-ranking="${step}"]{--ranking-progress:${
    progress * 100
  }%;--ranking-color:color-mix(in srgb,var(--${from}-7) ${weight}%,var(--${to}-7));}`;
}

export function GET() {
  let styles = "";

  for (let step = 0; step <= RANKING_STEPS; step++) {
    styles += stepStyles(step);
  }

  return new Response(styles);
}
