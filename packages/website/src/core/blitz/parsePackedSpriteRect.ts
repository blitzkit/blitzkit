const textDecoder = new TextDecoder();

function readFourCC(buffer: Uint8Array, offset: number) {
  return textDecoder.decode(buffer.subarray(offset, offset + 4));
}

export function parsePackedSpriteRect(buffer: Uint8Array): number[] | null {
  if (
    buffer.length < 12 ||
    readFourCC(buffer, 0) !== "RIFF" ||
    readFourCC(buffer, 8) !== "WEBP"
  ) {
    return null;
  }

  const view = new DataView(
    buffer.buffer,
    buffer.byteOffset,
    buffer.byteLength,
  );
  let offset = 12;

  while (offset + 8 <= buffer.length) {
    const chunkId = readFourCC(buffer, offset);
    const chunkSize = view.getUint32(offset + 4, true);
    const dataStart = offset + 8;
    const dataEnd = dataStart + chunkSize;

    if (dataEnd > buffer.length) return null;

    if (chunkId === "extr") {
      const lines = textDecoder
        .decode(buffer.subarray(dataStart, dataEnd))
        .replace(/\0/g, "")
        .split(/\r?\n/)
        .map((line) => line.trim().split(/\s+/).map(Number));

      for (const values of lines) {
        if (values.length < 4) continue;
        if (!values.slice(0, 4).every(Number.isFinite)) continue;
        if (values[2] <= 0 || values[3] <= 0) continue;

        return values;
      }

      return null;
    }

    offset = dataEnd + (chunkSize % 2);
  }

  return null;
}
