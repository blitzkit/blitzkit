import { times } from "lodash-es";
import type { Vector3Tuple, Vector4Tuple } from "three";
import { WindowsReadStream } from "./windows";

enum DxgiFormat {
  UNKNOWN = 0,
  R32G32B32A32_TYPELESS = 1,
  R32G32B32A32_FLOAT = 2,
  R32G32B32A32_UINT = 3,
  R32G32B32A32_SINT = 4,
  R32G32B32_TYPELESS = 5,
  R32G32B32_FLOAT = 6,
  R32G32B32_UINT = 7,
  R32G32B32_SINT = 8,
  R16G16B16A16_TYPELESS = 9,
  R16G16B16A16_FLOAT = 10,
  R16G16B16A16_UNORM = 11,
  R16G16B16A16_UINT = 12,
  R16G16B16A16_SNORM = 13,
  R16G16B16A16_SINT = 14,
  R32G32_TYPELESS = 15,
  R32G32_FLOAT = 16,
  R32G32_UINT = 17,
  R32G32_SINT = 18,
  R32G8X24_TYPELESS = 19,
  D32_FLOAT_S8X24_UINT = 20,
  R32_FLOAT_X8X24_TYPELESS = 21,
  X32_TYPELESS_G8X24_UINT = 22,
  R10G10B10A2_TYPELESS = 23,
  R10G10B10A2_UNORM = 24,
  R10G10B10A2_UINT = 25,
  R11G11B10_FLOAT = 26,
  R8G8B8A8_TYPELESS = 27,
  R8G8B8A8_UNORM = 28,
  R8G8B8A8_UNORM_SRGB = 29,
  R8G8B8A8_UINT = 30,
  R8G8B8A8_SNORM = 31,
  R8G8B8A8_SINT = 32,
  R16G16_TYPELESS = 33,
  R16G16_FLOAT = 34,
  R16G16_UNORM = 35,
  R16G16_UINT = 36,
  R16G16_SNORM = 37,
  R16G16_SINT = 38,
  R32_TYPELESS = 39,
  D32_FLOAT = 40,
  R32_FLOAT = 41,
  R32_UINT = 42,
  R32_SINT = 43,
  R24G8_TYPELESS = 44,
  D24_UNORM_S8_UINT = 45,
  R24_UNORM_X8_TYPELESS = 46,
  X24_TYPELESS_G8_UINT = 47,
  R8G8_TYPELESS = 48,
  R8G8_UNORM = 49,
  R8G8_UINT = 50,
  R8G8_SNORM = 51,
  R8G8_SINT = 52,
  R16_TYPELESS = 53,
  R16_FLOAT = 54,
  D16_UNORM = 55,
  R16_UNORM = 56,
  R16_UINT = 57,
  R16_SNORM = 58,
  R16_SINT = 59,
  R8_TYPELESS = 60,
  R8_UNORM = 61,
  R8_UINT = 62,
  R8_SNORM = 63,
  R8_SINT = 64,
  A8_UNORM = 65,
  R1_UNORM = 66,
  R9G9B9E5_SHAREDEXP = 67,
  R8G8_B8G8_UNORM = 68,
  G8R8_G8B8_UNORM = 69,
  BC1_TYPELESS = 70,
  BC1_UNORM = 71,
  BC1_UNORM_SRGB = 72,
  BC2_TYPELESS = 73,
  BC2_UNORM = 74,
  BC2_UNORM_SRGB = 75,
  BC3_TYPELESS = 76,
  BC3_UNORM = 77,
  BC3_UNORM_SRGB = 78,
  BC4_TYPELESS = 79,
  BC4_UNORM = 80,
  BC4_SNORM = 81,
  BC5_TYPELESS = 82,
  BC5_UNORM = 83,
  BC5_SNORM = 84,
  B5G6R5_UNORM = 85,
  B5G5R5A1_UNORM = 86,
  B8G8R8A8_UNORM = 87,
  B8G8R8X8_UNORM = 88,
  R10G10B10_XR_BIAS_A2_UNORM = 89,
  B8G8R8A8_TYPELESS = 90,
  B8G8R8A8_UNORM_SRGB = 91,
  B8G8R8X8_TYPELESS = 92,
  B8G8R8X8_UNORM_SRGB = 93,
  BC6H_TYPELESS = 94,
  BC6H_UF16 = 95,
  BC6H_SF16 = 96,
  BC7_TYPELESS = 97,
  BC7_UNORM = 98,
  BC7_UNORM_SRGB = 99,
  AYUV = 100,
  Y410 = 101,
  Y416 = 102,
  NV12 = 103,
  P010 = 104,
  P016 = 105,
  "420_OPAQUE" = 106,
  YUY2 = 107,
  Y210 = 108,
  Y216 = 109,
  NV11 = 110,
  AI44 = 111,
  IA44 = 112,
  P8 = 113,
  A8P8 = 114,
  B4G4R4A4_UNORM = 115,
  P208 = 130,
  V208 = 131,
  V408 = 132,
  SAMPLER_FEEDBACK_MIN_MIP_OPAQUE,
  SAMPLER_FEEDBACK_MIP_REGION_USED_OPAQUE,
  FORCE_UINT = 0xffffffff,
}

enum DdsDimension {
  UNKNOWN = 0,
  BUFFER = 1,
  TEXTURE1D = 2,
  TEXTURE2D = 3,
  TEXTURE3D = 4,
}

enum DdsdFlags {
  CAPS = 0x1,
  HEIGHT = 0x2,
  WIDTH = 0x4,
  PITCH = 0x8,
  PIXELFORMAT = 0x1000,
  MIPMAPCOUNT = 0x20000,
  LINEARSIZE = 0x80000,
  DEPTH = 0x800000,
}

enum DdpfFlags {
  ALPHA = 0x1,
  FOURCC = 0x4,
  RGB = 0x40,
  YUV = 0x200,
  LUMINANCE = 0x20000,
}

enum DdsCaps {
  COMPLEX = 0x8,
  MIPMAP = 0x400000,
  TEXTURE = 0x1000,
}

enum DdsCaps2 {
  CUBEMAP = 0x200,
  CUBEMAP_POSITIVEX = 0x400,
  CUBEMAP_NEGATIVEX = 0x800,
  CUBEMAP_POSITIVEY = 0x1000,
  CUBEMAP_NEGATIVEY = 0x2000,
  CUBEMAP_POSITIVEZ = 0x4000,
  CUBEMAP_NEGATIVEZ = 0x8000,
  VOLUME = 0x200000,
}

export class DdsReadStream extends WindowsReadStream {
  async dds() {
    this.magicNumber();
    const header = this.header();
    const dxgiFormat = this.resolveDxgiFormat(header);

    switch (dxgiFormat) {
      case DxgiFormat.BC1_TYPELESS:
      case DxgiFormat.BC1_UNORM:
      case DxgiFormat.BC1_UNORM_SRGB: {
        return this.iterateBlocks(header.width, header.height, () => {
          const colorInterpolations = this.bc1ColorInterpolations();
          const colorKeys = this.bc1ColorKeys();
          return (index) => colorInterpolations[colorKeys[index]];
        });
      }

      case DxgiFormat.BC2_TYPELESS:
      case DxgiFormat.BC2_UNORM:
      case DxgiFormat.BC2_UNORM_SRGB: {
        return this.iterateBlocks(header.width, header.height, () => {
          const alphaInterpolations = this.bc2AlphaInterpolations();
          const colorInterpolations = this.bc2ColorInterpolations();
          const colorKeys = this.bc1ColorKeys();
          return (index) => {
            return [
              ...colorInterpolations[colorKeys[index]],
              alphaInterpolations[index],
            ];
          };
        });
      }

      case DxgiFormat.BC3_TYPELESS:
      case DxgiFormat.BC3_UNORM:
      case DxgiFormat.BC3_UNORM_SRGB: {
        return this.iterateBlocks(header.width, header.height, () => {
          const alphaInterpolations = this.bc3AlphaInterpolations();
          const alphaKeys = this.bc3AlphaKeys();
          const colorInterpolations = this.bc2ColorInterpolations();
          const colorKeys = this.bc1ColorKeys();
          return (index) => [
            ...colorInterpolations[colorKeys[index]],
            alphaInterpolations[alphaKeys[index]],
          ];
        });
      }

      default:
        throw new TypeError(
          `Unsupported DXGI format: ${DxgiFormat[dxgiFormat]} (${dxgiFormat})`
        );
    }
  }

  magicNumber() {
    const magic = this.dword();

    if (magic !== 0x20534444) {
      throw new Error(`Invalid DDS magic number: 0x${magic.toString(16)}`);
    }

    return magic;
  }
  pixelFormat() {
    return {
      size: this.dword(),
      flags: this.dword() as DdpfFlags,
      fourCC: this.ascii(4),
      rgbBitCount: this.dword(),
      rBitMask: this.dword(),
      gBitMask: this.dword(),
      bBitMask: this.dword(),
      aBitMask: this.dword(),
    };
  }
  header() {
    return {
      size: this.dword(),
      flags: this.dword() as DdsdFlags,
      height: this.dword(),
      width: this.dword(),
      pitchOrLinearSize: this.dword(),
      depth: this.dword(),
      mipMapCount: this.dword(),
      reserved1: times(11, () => this.dword()),
      pf: this.pixelFormat(),
      caps: this.dword() as DdsCaps,
      caps2: this.dword() as DdsCaps2,
      caps3: this.dword(),
      caps4: this.dword(),
      reserved2: times(1, () => this.dword()),
    };
  }
  headerDxt10() {
    return {
      dxgiFormat: this.dword() as DxgiFormat,
      resourceDimension: this.dword() as DdsDimension,
      miscFlag: this.dword(),
      arraySize: this.dword(),
      miscFlags2: this.dword(),
    };
  }

  resolveDxgiFormat(header: ReturnType<typeof this.header>) {
    switch (header.pf.fourCC) {
      case "DXT1":
        return DxgiFormat.BC1_UNORM;

      case "DXT3":
        return DxgiFormat.BC2_UNORM;

      case "DXT5":
        return DxgiFormat.BC3_UNORM;

      case "DX10":
        return this.headerDxt10().dxgiFormat;

      default:
        throw new TypeError(`Unsupported FourCC: ${header.pf.fourCC}`);
    }
  }

  assetFactor4(width: number, height: number) {
    if (width % 4 !== 0 || height % 4 !== 0) {
      throw new RangeError("Width and height must be divisible by 4");
    }
  }
  iterateBlocks(
    width: number,
    height: number,
    blockIterator: () => (index: number) => Vector4Tuple
  ) {
    this.assetFactor4(width, height);
    const data = Buffer.alloc(width * height * 4);
    const blocksX = width / 4;
    const blocksY = height / 4;

    times(blocksX * blocksY, (index) => {
      const blockPosX = (index % blocksX) * 4;
      const blockPosY = Math.floor(index / blocksX) * 4;
      const pixelIterator = blockIterator();

      times(16, (pixelIndex) => {
        const pixelPosX = pixelIndex % 4;
        const pixelPosY = Math.floor(pixelIndex / 4);
        const x = blockPosX + pixelPosX;
        const y = blockPosY + pixelPosY;
        const bufferIndex = 4 * (y * width + x);

        pixelIterator(pixelIndex).forEach((channel, index) => {
          data[bufferIndex + index] = Math.round(channel * 255);
        });
      });
    });

    return { data, width, height, channels: 4 as const };
  }

  readR5G6B5Int() {
    return new DataView(this.read(2)).getUint16(0, true);
  }
  R5G6B5() {
    const buffer = this.consumeUint8Array(2);
    const r = (buffer[1] & 0b11111000) >>> 3;
    const g = ((buffer[1] & 0b111) << 3) | ((buffer[0] & 0b11100000) >>> 5);
    const b = buffer[0] & 0b11111;

    return [r / 31, g / 63, b / 31] as Vector3Tuple;
  }
  R5G6B5A0() {
    return [...this.R5G6B5(), 1] as Vector4Tuple;
  }
  A8() {
    return this.uint8() / 255;
  }

  bc1ColorInterpolations() {
    const int0 = this.readR5G6B5Int();
    const color0 = this.R5G6B5A0();
    const int1 = this.readR5G6B5Int();
    const color1 = this.R5G6B5A0();
    const alpha = int0 < int1;
    const color2 = alpha
      ? (color0.map(
          (channel0, index) => (channel0 + color1[index]) / 2
        ) as Vector4Tuple)
      : (color0.map(
          (channel0, index) => (2 * channel0 + color1[index]) / 3
        ) as Vector4Tuple);
    const color3 = alpha
      ? ([0, 0, 0, 0] as Vector4Tuple)
      : (color0.map(
          (channel0, index) => (channel0 + 2 * color1[index]) / 3
        ) as Vector4Tuple);

    return {
      [0b00]: color0,
      [0b01]: color1,
      [0b10]: color2,
      [0b11]: color3,
    } as Record<number, Vector4Tuple>;
  }
  bc1ColorKeys() {
    const buffer = this.consumeUint8Array(4);
    const d = (buffer[0] & 0b11000000) >>> 6;
    const c = (buffer[0] & 0b110000) >>> 4;
    const b = (buffer[0] & 0b1100) >>> 2;
    const a = buffer[0] & 0b11;
    const h = (buffer[1] & 0b11000000) >>> 6;
    const g = (buffer[1] & 0b110000) >>> 4;
    const f = (buffer[1] & 0b1100) >>> 2;
    const e = buffer[1] & 0b11;
    const l = (buffer[2] & 0b11000000) >>> 6;
    const k = (buffer[2] & 0b110000) >>> 4;
    const j = (buffer[2] & 0b1100) >>> 2;
    const i = buffer[2] & 0b11;
    const p = (buffer[3] & 0b11000000) >>> 6;
    const o = (buffer[3] & 0b110000) >>> 4;
    const n = (buffer[3] & 0b1100) >>> 2;
    const m = buffer[3] & 0b11;

    return [a, b, c, d, e, f, g, h, i, j, k, l, m, n, o, p];
  }
  bc2AlphaInterpolations() {
    const buffer = this.consumeUint8Array(8);
    const d = (buffer[1] & 0b11110000) >>> 4;
    const c = buffer[1] & 0b1111;
    const b = (buffer[0] & 0b11110000) >>> 4;
    const a = buffer[0] & 0b1111;
    const h = (buffer[3] & 0b11110000) >>> 4;
    const g = buffer[3] & 0b1111;
    const f = (buffer[2] & 0b11110000) >>> 4;
    const e = buffer[2] & 0b1111;
    const l = (buffer[5] & 0b11110000) >>> 4;
    const k = buffer[5] & 0b1111;
    const j = (buffer[4] & 0b11110000) >>> 4;
    const i = buffer[4] & 0b1111;
    const p = (buffer[7] & 0b11110000) >>> 4;
    const o = buffer[7] & 0b1111;
    const n = (buffer[6] & 0b11110000) >>> 4;
    const m = buffer[6] & 0b1111;

    return [a, b, c, d, e, f, g, h, i, j, k, l, m, n, o, p].map(
      (alpha) => alpha / 15
    );
  }
  bc2ColorInterpolations() {
    const color0 = this.R5G6B5();
    const color1 = this.R5G6B5();
    const color2 = color0.map(
      (channel0, index) => (2 * channel0 + color1[index]) / 3
    ) as Vector3Tuple;
    const color3 = color0.map(
      (channel0, index) => (channel0 + 2 * color1[index]) / 3
    ) as Vector3Tuple;

    return {
      [0b00]: color0,
      [0b01]: color1,
      [0b10]: color2,
      [0b11]: color3,
    } as Record<number, Vector3Tuple>;
  }
  bc3AlphaInterpolations() {
    const alpha0 = this.A8();
    const alpha1 = this.A8();
    const full = alpha0 > alpha1;

    return {
      [0b000]: alpha0,
      [0b001]: alpha1,

      ...(full
        ? {
            [0b010]: (6 * alpha0 + 1 * alpha1) / 7,
            [0b011]: (5 * alpha0 + 2 * alpha1) / 7,
            [0b100]: (4 * alpha0 + 3 * alpha1) / 7,
            [0b101]: (3 * alpha0 + 4 * alpha1) / 7,
            [0b110]: (2 * alpha0 + 5 * alpha1) / 7,
            [0b111]: (1 * alpha0 + 6 * alpha1) / 7,
          }
        : {
            [0b010]: (4 * alpha0 + 1 * alpha1) / 5,
            [0b011]: (3 * alpha0 + 2 * alpha1) / 5,
            [0b100]: (2 * alpha0 + 3 * alpha1) / 5,
            [0b101]: (1 * alpha0 + 4 * alpha1) / 5,
            [0b110]: 0,
            [0b111]: 255,
          }),
    } as Record<number, number>;
  }
  bc3AlphaKeys() {
    const buffer = this.consumeUint8Array(6);
    const h = (buffer[2] & 0b11100000) >>> 5;
    const g = (buffer[2] & 0b11100) >>> 2;
    const f = ((buffer[2] & 0b11) << 1) | ((buffer[1] & 0b10000000) >>> 7);
    const e = (buffer[1] & 0b1110000) >>> 4;
    const d = (buffer[1] & 0b1110) >>> 1;
    const c = ((buffer[1] & 0b1) << 2) | ((buffer[0] & 0b11000000) >>> 6);
    const b = (buffer[0] & 0b111000) >>> 3;
    const a = buffer[0] & 0b111;
    const p = (buffer[5] & 0b11100000) >>> 5;
    const o = (buffer[5] & 0b11100) >>> 2;
    const n = ((buffer[5] & 0b11) << 1) | ((buffer[4] & 0b10000000) >>> 7);
    const m = (buffer[4] & 0b1110000) >>> 4;
    const l = (buffer[4] & 0b1110) >>> 1;
    const k = ((buffer[4] & 0b1) << 2) | ((buffer[3] & 0b11000000) >>> 6);
    const j = (buffer[3] & 0b111000) >>> 3;
    const i = buffer[3] & 0b111;

    return [a, b, c, d, e, f, g, h, i, j, k, l, m, n, o, p];
  }
}
