import { clamp, isEqual, times } from "lodash-es";
import { ReadStream } from "./buffer";

export enum PvrFlags {
  NoFlag = 0,
  PreMultiplied = 0x02,
}

export enum PvrPixelFormat {
  PVRTC_2bpp_RGB = 0,
  PVRTC_2bpp_RGBA = 1,
  PVRTC_4bpp_RGB = 2,
  PVRTC_4bpp_RGBA = 3,
  PVRTC_II_2bpp = 4,
  PVRTC_II_4bpp = 5,
  ETC1 = 6,
  DXT1_BC1 = 7,
  DXT2 = 8,
  DXT3_BC2 = 9,
  DXT4 = 10,
  DXT5_BC3 = 11,
  BC4 = 12,
  BC5 = 13,
  BC6 = 14,
  BC7 = 15,
  UYVY = 16,
  YUY2 = 17,
  BW1bpp = 18,
  R9G9B9E5_SharedExponent = 19,
  RGBG8888 = 20,
  GRGB8888 = 21,
  ETC2_RGB = 22,
  ETC2_RGBA = 23,
  ETC2_RGB_A1 = 24,
  EAC_R11 = 25,
  EAC_RG11 = 26,
  ASTC_4x4 = 27,
  ASTC_5x4 = 28,
  ASTC_5x5 = 29,
  ASTC_6x5 = 30,
  ASTC_6x6 = 31,
  ASTC_8x5 = 32,
  ASTC_8x6 = 33,
  ASTC_8x8 = 34,
  ASTC_10x5 = 35,
  ASTC_10x6 = 36,
  ASTC_10x8 = 37,
  ASTC_10x10 = 38,
  ASTC_12x10 = 39,
  ASTC_12x12 = 40,
  ASTC_3x3x3 = 41,
  ASTC_4x3x3 = 42,
  ASTC_4x4x3 = 43,
  ASTC_4x4x4 = 44,
  ASTC_5x4x4 = 45,
  ASTC_5x5x4 = 46,
  ASTC_5x5x5 = 47,
  ASTC_6x5x5 = 48,
  ASTC_6x6x5 = 49,
  ASTC_6x6x6 = 50,
  BASISU_ETC1S = 51,
  BASISU_UASTC = 52,
  RGBM = 53,
  RGBD = 54,
}

enum PvrColorSpace {
  LinearRGB = 0,
  sRGB = 1,
}

enum PvrChannelType {
  UnsignedByteNormalised = 0,
  SignedByteNormalised = 1,
  UnsignedByte = 2,
  SignedByte = 3,
  UnsignedShortNormalised = 4,
  SignedShortNormalised = 5,
  UnsignedShort = 6,
  SignedShort = 7,
  UnsignedIntegerNormalised = 8,
  SignedIntegerNormalised = 9,
  UnsignedInteger = 10,
  SignedInteger = 11,
  SignedFloat = 12,
  UnsignedFloat = 13,
}

enum ResolvedBitRatePixelFormat {
  R4G4B4A4,
  R5G6B5A0,
}

export class PvrReadStream extends ReadStream {
  pvr() {
    const header = this.header();
    this.metadata();

    if (typeof header.pixelFormat === "number") {
      switch (header.pixelFormat) {
        default:
          throw new TypeError(
            `Unhandled pixel format ${PvrPixelFormat[header.pixelFormat]} (${
              header.pixelFormat
            })`,
          );
      }
    } else {
      const resolvedPixelFormat = this.resolveBitRatePixelFormat(
        header.pixelFormat,
      );
      const pixelCount = header.width * header.height;

      switch (resolvedPixelFormat) {
        case ResolvedBitRatePixelFormat.R4G4B4A4: {
          const data = Buffer.alloc(pixelCount * 4);

          times(pixelCount, (index) => {
            const buffer = this.consumeUint8Array(2);
            const bufferIndex = index * 4;
            const r = ((buffer[1] & 0b11110000) >>> 4) / 15;
            const g = (buffer[1] & 0b1111) / 15;
            const b = ((buffer[0] & 0b11110000) >>> 4) / 15;
            const a = (buffer[0] & 0b1111) / 15;

            data[bufferIndex] = Math.round(clamp(r * 255, 0, 255));
            data[bufferIndex + 1] = Math.round(clamp(g * 255, 0, 255));
            data[bufferIndex + 2] = Math.round(clamp(b * 255, 0, 255));
            data[bufferIndex + 3] = Math.round(clamp(a * 255, 0, 255));
          });

          return {
            data,
            width: header.width,
            height: header.height,
            channels: 4 as const,
          };
        }

        case ResolvedBitRatePixelFormat.R5G6B5A0: {
          const data = Buffer.alloc(pixelCount * 3);

          times(pixelCount, (index) => {
            const buffer = this.consumeUint8Array(2);
            const bufferIndex = index * 3;
            const r = ((buffer[1] & 0b11111000) >>> 3) / 31;
            const g =
              (((buffer[1] & 0b111) << 3) | ((buffer[0] & 0b11100000) >>> 5)) /
              63;
            const b = (buffer[0] & 0b11111) / 31;

            data[bufferIndex] = Math.round(clamp(r * 255, 0, 255));
            data[bufferIndex + 1] = Math.round(clamp(g * 255, 0, 255));
            data[bufferIndex + 2] = Math.round(clamp(b * 255, 0, 255));
          });

          return {
            data,
            width: header.width,
            height: header.height,
            channels: 3 as const,
          };
        }

        default:
          throw new TypeError(
            `Unhandled resolved pixel format ${resolvedPixelFormat} (${header.pixelFormat})`,
          );
      }
    }
  }

  header() {
    const header = {
      version: this.ascii(4),
      flags: this.uint32() as PvrFlags,
      pixelFormat: this.pixelFormat(),
      colorSpace: this.uint32() as PvrColorSpace,
      channelType: this.uint32() as PvrChannelType,
      height: this.uint32(),
      width: this.uint32(),
      depth: this.uint32(),
      surfaces: this.uint32(),
      faces: this.uint32(),
      mipMaps: this.uint32(),
      metadataSize: this.uint32(),
    };

    if (header.version !== "PVR\x03") throw new TypeError("Endian mismatch");

    return header;
  }
  pixelFormat() {
    this.seek(4);
    const usesPresetFormat = this.uint32() === 0;
    this.seek(-8);

    return usesPresetFormat
      ? (Number(this.uint64()) as PvrPixelFormat)
      : {
          order: this.ascii(4),
          bitRates: times(4, () => this.uint8()),
        };
  }
  resolveBitRatePixelFormat(
    pixelFormat: Exclude<ReturnType<typeof this.pixelFormat>, number>,
  ) {
    if (pixelFormat.order === "rgba") {
      if (isEqual(pixelFormat.bitRates, [4, 4, 4, 4])) {
        return ResolvedBitRatePixelFormat.R4G4B4A4;
      } else
        throw new TypeError(
          `Unhandled rgba bit rate ${pixelFormat.bitRates.join(", ")}`,
        );
    } else if (pixelFormat.order === "rgb\0") {
      if (isEqual(pixelFormat.bitRates, [5, 6, 5, 0])) {
        return ResolvedBitRatePixelFormat.R5G6B5A0;
      } else
        throw new TypeError(
          `Unhandled rgb bit rate ${pixelFormat.bitRates.join(", ")}`,
        );
    } else {
      throw new TypeError(`Unhandled pixel order ${pixelFormat.order}`);
    }
  }
  metadata() {
    const fourCC = this.ascii(4);
    const key = this.uint32();
    const dataSize = this.uint32();
    const data = this.consume(dataSize);

    return {
      fourCC,
      key,
      dataSize,
      data,
    };
  }
}
