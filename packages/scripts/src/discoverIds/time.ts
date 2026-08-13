import { API_RATE } from "./constants";

const MAX_COMPUTE_TIME = (5 * 60 + 55) * 60 * 1000; // 5hr 55min

const t0 = performance.now();
const t1 = t0 + MAX_COMPUTE_TIME;

export function withinTimeLimit() {
  return performance.now() < t1;
}

export function sleep(t: number) {
  return new Promise((resolve) => setTimeout(resolve, t));
}

interface MethodContext {
  _break(): void;
}

let lastT = 0;
const maxDelta = 1000 / API_RATE;
const DELTA_BUFFER = 0;
export async function atMaxRate(method: (context: MethodContext) => void) {
  let isBroken = false;

  const context: MethodContext = {
    _break() {
      isBroken = true;
    },
  };

  while (!isBroken) {
    if (!withinTimeLimit()) break;

    const t = performance.now();
    const delta = t - lastT;

    if (delta < maxDelta) {
      await sleep(maxDelta - delta + DELTA_BUFFER);
    }

    method(context);
    lastT = t;
  }
}
