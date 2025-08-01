export function fakeLog(x: number, a = 1) {
  return (2 / Math.PI) * Math.atan((Math.PI * a * x) / 2);
}

export function fakeLogInverse(y: number, a = 1) {
  return (2 / (Math.PI * a)) * Math.tan((Math.PI * y) / 2);
}
