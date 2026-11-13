import { times } from "lodash-es";
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

enum BlockFormat {
  BC1,
  BC2,
  BC3,
}

// red, green and blue of a packed 5:6:5 color
const CHANNEL_SHIFTS = [11, 5, 0];
const CHANNEL_MAXIMUMS = [31, 63, 31];

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
      case DxgiFormat.BC1_UNORM_SRGB:
        return this.decodeBlocks(header.width, header.height, BlockFormat.BC1);

      case DxgiFormat.BC2_TYPELESS:
      case DxgiFormat.BC2_UNORM:
      case DxgiFormat.BC2_UNORM_SRGB:
        return this.decodeBlocks(header.width, header.height, BlockFormat.BC2);

      case DxgiFormat.BC3_TYPELESS:
      case DxgiFormat.BC3_UNORM:
      case DxgiFormat.BC3_UNORM_SRGB:
        return this.decodeBlocks(header.width, header.height, BlockFormat.BC3);

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
  /**
   * writes each 4x4 block straight into the image; a block's palette is worked
   * out from 0 to 1 and rounded to bytes once, as each pixel would round it
   */
  decodeBlocks(width: number, height: number, format: BlockFormat) {
    this.assetFactor4(width, height);
    const data = Buffer.alloc(width * height * 4);
    const bytes = new Uint8Array(this.buffer);
    // 4 colors of red, green, blue and alpha
    const colors = new Uint8Array(16);
    // BC2 has an alpha per pixel, BC3 a palette of 8
    const alphas = new Uint8Array(16);

    for (let blockY = 0; blockY < height; blockY += 4) {
      for (let blockX = 0; blockX < width; blockX += 4) {
        let index = this.index;
        // BC3's 3 bit alpha keys, 8 pixels to each half
        let alphaKeysLow = 0;
        let alphaKeysHigh = 0;

        if (format === BlockFormat.BC2) {
          for (let pixel = 0; pixel < 16; pixel++) {
            const alpha =
              (bytes[index + (pixel >> 1)] >> ((pixel & 1) * 4)) & 0b1111;

            alphas[pixel] = Math.round((alpha / 15) * 255);
          }

          index += 8;
        } else if (format === BlockFormat.BC3) {
          this.bc3Alphas(bytes[index] / 255, bytes[index + 1] / 255, alphas);
          alphaKeysLow =
            bytes[index + 2] |
            (bytes[index + 3] << 8) |
            (bytes[index + 4] << 16);
          alphaKeysHigh =
            bytes[index + 5] |
            (bytes[index + 6] << 8) |
            (bytes[index + 7] << 16);
          index += 8;
        }

        const int0 = bytes[index] | (bytes[index + 1] << 8);
        const int1 = bytes[index + 2] | (bytes[index + 3] << 8);
        const colorKeys =
          bytes[index + 4] |
          (bytes[index + 5] << 8) |
          (bytes[index + 6] << 16) |
          (bytes[index + 7] << 24);

        // only BC1 has a transparent color
        this.blockColors(
          int0,
          int1,
          format === BlockFormat.BC1 && int0 < int1,
          colors
        );
        this.index = index + 8;

        for (let pixel = 0; pixel < 16; pixel++) {
          const offset =
            4 * ((blockY + (pixel >> 2)) * width + blockX + (pixel & 3));
          const color = 4 * ((colorKeys >>> (pixel * 2)) & 0b11);

          data[offset] = colors[color];
          data[offset + 1] = colors[color + 1];
          data[offset + 2] = colors[color + 2];

          if (format === BlockFormat.BC1) {
            data[offset + 3] = colors[color + 3];
          } else if (format === BlockFormat.BC2) {
            data[offset + 3] = alphas[pixel];
          } else {
            const alphaKey =
              pixel < 8
                ? (alphaKeysLow >> (pixel * 3)) & 0b111
                : (alphaKeysHigh >> ((pixel - 8) * 3)) & 0b111;

            data[offset + 3] = alphas[alphaKey];
          }
        }
      }
    }

    return { data, width, height, channels: 4 as const };
  }

  blockColors(
    int0: number,
    int1: number,
    transparent: boolean,
    colors: Uint8Array
  ) {
    for (let channel = 0; channel < 3; channel++) {
      const shift = CHANNEL_SHIFTS[channel];
      const maximum = CHANNEL_MAXIMUMS[channel];
      const value0 = ((int0 >> shift) & maximum) / maximum;
      const value1 = ((int1 >> shift) & maximum) / maximum;

      colors[channel] = Math.round(value0 * 255);
      colors[4 + channel] = Math.round(value1 * 255);
      colors[8 + channel] = Math.round(
        (transparent ? (value0 + value1) / 2 : (2 * value0 + value1) / 3) * 255
      );
      colors[12 + channel] = transparent
        ? 0
        : Math.round(((value0 + 2 * value1) / 3) * 255);
    }

    colors[3] = 255;
    colors[7] = 255;
    colors[11] = 255;
    colors[15] = transparent ? 0 : 255;
  }

  bc3Alphas(alpha0: number, alpha1: number, alphas: Uint8Array) {
    const full = alpha0 > alpha1;
    const values = full
      ? [
          alpha0,
          alpha1,
          (6 * alpha0 + 1 * alpha1) / 7,
          (5 * alpha0 + 2 * alpha1) / 7,
          (4 * alpha0 + 3 * alpha1) / 7,
          (3 * alpha0 + 4 * alpha1) / 7,
          (2 * alpha0 + 5 * alpha1) / 7,
          (1 * alpha0 + 6 * alpha1) / 7,
        ]
      : [
          alpha0,
          alpha1,
          (4 * alpha0 + 1 * alpha1) / 5,
          (3 * alpha0 + 2 * alpha1) / 5,
          (2 * alpha0 + 3 * alpha1) / 5,
          (1 * alpha0 + 4 * alpha1) / 5,
          0,
          // kept as the decoder always had it, which wraps to 1 as a byte
          255,
        ];

    for (let key = 0; key < 8; key++) {
      alphas[key] = Math.round(values[key] * 255);
    }
  }
}
