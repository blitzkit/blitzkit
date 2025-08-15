const GAMMA = 1.2;

export function fakeLogSquishyHigh(x: number) {
  return Math.sin((Math.PI / 2) * x) ** (1 / GAMMA);
}

export function fakeLogSquishyHighInverse(y: number) {
  return (2 / Math.PI) * Math.asin(y ** GAMMA);
}

export function fakeLogSquishyLow(x: number) {
  return x ** 2;
}

export function fakeLogSquishyLowInverse(y: number) {
  return y ** (1 / 2);
}
