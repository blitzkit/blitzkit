const GAMMA = 1.2;

export function fakeLog(x: number, a = 1) {
  return Math.sin((Math.PI / 2) * x) ** (1 / GAMMA);
}

export function fakeLogInverse(y: number, a = 1) {
  return (2 / Math.PI) * Math.asin(y ** GAMMA);
}
