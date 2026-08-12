import { API_RATE } from "./constants";

const MAX_COMPUTE_TIME = (5 * 60 + 55) * 60 * 1000; // 5hr 55min

const t0 = performance.now();
const t1 = t0 + MAX_COMPUTE_TIME;

export function withinTimeLimit() {
  return performance.now() < t1;
}

export function sleep() {
  return new Promise((resolve) => setTimeout(resolve, 1000 / API_RATE));
}
