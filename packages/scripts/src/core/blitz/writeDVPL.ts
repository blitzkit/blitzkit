import { crc32 } from "crc";
import { compressBlock } from "lz4js";

/**
 * Thanks Maddoxkkm! Modernized heavily.
 *
 * https://github.com/Maddoxkkm/dvpl_converter/
 */
export function writeDVPL(buffer: Buffer) {
  const source = new Uint8Array(buffer);
  const destination = new Uint8Array(buffer.length);
  const compressedBlockSize = compressBlock(
    source,
    destination,
    0,
    source.length,
    [0],
  );
  let output = Buffer.from(destination);

  if (compressedBlockSize === 0 || compressedBlockSize >= buffer.length) {
    const footerBuffer = toDVPLFooter(
      buffer.length,
      buffer.length,
      crc32(buffer),
      0,
    );

    return Buffer.concat(
      [new Uint8Array(buffer), new Uint8Array(footerBuffer)],
      buffer.length + 20,
    );
  } else {
    output = output.subarray(0, compressedBlockSize);
    const footerBuffer = toDVPLFooter(
      buffer.length,
      compressedBlockSize,
      crc32(output),
      2,
    );

    return Buffer.concat(
      [new Uint8Array(output), new Uint8Array(footerBuffer)],
      compressedBlockSize + 20,
    );
  }
}

function toDVPLFooter(
  inputSize: number,
  compressedSize: number,
  crc32: number,
  type: number,
) {
  const result = Buffer.alloc(20);

  result.writeUInt32LE(inputSize, 0);
  result.writeUInt32LE(compressedSize, 4);
  result.writeUInt32LE(crc32, 8);
  result.writeUInt32LE(type, 12);
  result.write("DVPL", 16, 4, "utf8");

  return result;
}
