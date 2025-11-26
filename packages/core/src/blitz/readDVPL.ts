import { crc32 } from "crc";
import { decompressBlock } from "lz4js";

/**
 * Thanks Maddoxkkm! Modified heavily to be modern.
 * https://github.com/Maddoxkkm/dvpl_converter/
 */
export function readDVPL(buffer: Buffer) {
  const footerBuffer = buffer.subarray(buffer.length - 20, buffer.length);

  if (
    footerBuffer.toString("utf8", 16, 20) !== "DVPL" ||
    footerBuffer.length !== 20
  ) {
    throw new SyntaxError("Invalid DVPL footer");
  }

  const footerData = {
    oSize: footerBuffer.readUInt32LE(0),
    cSize: footerBuffer.readUInt32LE(4),
    crc32: footerBuffer.readUInt32LE(8),
    type: footerBuffer.readUInt32LE(12),
  };
  const targetBlock = buffer.subarray(0, buffer.length - 20);

  if (targetBlock.length !== footerData.cSize) {
    throw new RangeError("DVPL size mismatch");
  }
  if (crc32(targetBlock) !== footerData.crc32) {
    throw new TypeError("DVPL CRC32 mismatch");
  }

  if (footerData.type === 0) {
    if (!(footerData.oSize === footerData.cSize && footerData.type === 0)) {
      throw new RangeError("DVPL type and size mismatch");
    }

    return targetBlock;
  } else if (footerData.type === 1 || footerData.type === 2) {
    const source = new Uint8Array(targetBlock);
    const destination = new Uint8Array(footerData.oSize);
    const decompressedSize = decompressBlock(
      source,
      destination,
      0,
      source.length,
      0
    );

    if (decompressedSize !== footerData.oSize) {
      throw new RangeError(
        `Decompressed DVPL size mismatch (${decompressedSize} vs ${footerData.oSize})`
      );
    }

    return Buffer.from(destination);
  } else {
    throw new SyntaxError("Unknown DVPL format");
  }
}
