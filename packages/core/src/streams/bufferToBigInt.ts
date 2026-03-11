export function bufferToBigInt(buffer: ArrayBuffer) {
  return new DataView(buffer).getBigUint64(0, true);
}