import type { lzma, lzma2 } from "@napi-rs/lzma";
import type { crc32 } from "node:zlib";
import {
  SEVEN_ZIP_SIGNATURE_HEADER_SIZE,
  SevenZipReadStream,
  type SevenZipCoder,
  type SevenZipFileInfo,
  type SevenZipStreamsInfo,
} from "../../../streams/sevenZip";
import type { HTTPMultiRangeReader } from "./rangeReader";

const enum Method {
  LZMA2 = 0x21,
  LZMA = 0x030101,
}

export interface SevenZipEntry {
  name: string;
  isDir: boolean;
  // -1 for entries without data (directories, empty files)
  folder: number;
}

export class SevenZipArchive {
  entries: SevenZipEntry[] = [];
  private streams: SevenZipStreamsInfo = {
    packPos: 0,
    packSizes: [],
    folders: [],
  };
  private packOffsets: number[] = [];
  private lzma?: typeof lzma;
  private lzma2?: typeof lzma2;
  private crc32?: typeof crc32;

  private constructor(private source: HTTPMultiRangeReader) {}

  static async open(source: HTTPMultiRangeReader) {
    const archive = new SevenZipArchive(source);
    await archive.init();
    return archive;
  }

  async read(entry: SevenZipEntry) {
    if (entry.folder === -1) return new Uint8Array(0);

    return this.decodeFolder(this.streams, this.packOffsets, entry.folder);
  }

  private async init() {
    const napiLzma = await import("@napi-rs/lzma");
    const zlib = await import("node:zlib");

    this.lzma = napiLzma.lzma;
    this.lzma2 = napiLzma.lzma2;
    this.crc32 = zlib.crc32;

    const signature = await this.source.read(
      0,
      SEVEN_ZIP_SIGNATURE_HEADER_SIZE,
    );
    const { startHeaderCrc, nextHeaderOffset, nextHeaderSize, nextHeaderCrc } =
      new SevenZipReadStream(signature.buffer).signatureHeader();

    if (this.crc32!(signature.subarray(12)) !== startHeaderCrc) {
      throw new Error("7z: bad start header CRC");
    }

    let header = await this.source.read(
      SEVEN_ZIP_SIGNATURE_HEADER_SIZE + nextHeaderOffset,
      nextHeaderSize,
    );

    if (this.crc32!(header) !== nextHeaderCrc) {
      throw new Error("7z: bad header CRC");
    }

    while (true) {
      const parsed = new SevenZipReadStream(header.buffer).header();

      if (!parsed.encoded) {
        this.streams = parsed.streams;
        this.packOffsets = this.computePackOffsets(parsed.streams);
        this.indexEntries(parsed.files);
        return;
      }

      header = await this.decodeFolder(
        parsed.streams,
        this.computePackOffsets(parsed.streams),
        0,
      );
    }
  }

  // files with data fill each folder's unpack streams in order
  private indexEntries(files: SevenZipFileInfo[]) {
    const folders = this.streams.folders;
    let folderIndex = 0;
    let streamIndex = 0;

    for (const file of files) {
      if (!file.hasStream) {
        this.entries.push({ name: file.name, isDir: file.isDir, folder: -1 });
        continue;
      }

      while (
        folderIndex < folders.length &&
        streamIndex >= folders[folderIndex].numUnpackStreams
      ) {
        folderIndex++;
        streamIndex = 0;
      }

      if (folderIndex === folders.length) {
        throw new Error("7z: more files than streams");
      }

      this.entries.push({ name: file.name, isDir: false, folder: folderIndex });
      streamIndex++;
    }
  }

  private computePackOffsets(streams: SevenZipStreamsInfo) {
    const offsets = [SEVEN_ZIP_SIGNATURE_HEADER_SIZE + streams.packPos];

    for (const size of streams.packSizes) {
      offsets.push(offsets[offsets.length - 1] + size);
    }

    return offsets;
  }

  private async decodeFolder(
    streams: SevenZipStreamsInfo,
    packOffsets: number[],
    index: number,
  ) {
    const folder = streams.folders[index];

    if (folder.numUnpackStreams !== 1) {
      throw new Error("7z: solid folders are not supported");
    }

    // filter chains like bcj only wrap the exes and dlls, which are never read
    if (folder.coders.length !== 1) {
      throw new Error(
        `7z: coder chain ${folder.coders.map((coder) =>
          coder.method.toString(16),
        )} is not supported`,
      );
    }

    const start = packOffsets[folder.firstPackStream];
    const packed = await this.source.read(
      start,
      packOffsets[folder.firstPackStream + 1] - start,
    );
    const data = await this.runCoder(
      folder.coders[0],
      packed,
      folder.unpackSize,
    );

    if (folder.crc !== undefined && this.crc32!(data) !== folder.crc) {
      throw new Error(`7z: CRC mismatch for folder ${index}`);
    }

    return data;
  }

  private async runCoder(
    coder: SevenZipCoder,
    input: Uint8Array<ArrayBuffer>,
    size: number,
  ) {
    let data: Uint8Array<ArrayBuffer>;

    switch (coder.method) {
      case Method.LZMA2:
        data = await this.decodeLZMA2(input, coder.props);
        break;

      case Method.LZMA:
        data = this.decodeLZMA(input, coder.props, size);
        break;

      default:
        throw new Error(`7z: unsupported method ${coder.method.toString(16)}`);
    }

    if (data.length !== size) throw new Error("7z: unpacked size mismatch");

    return data;
  }

  // 7z stores lzma props apart from the stream, so rebuild the .lzma header around it
  private decodeLZMA(
    input: Uint8Array<ArrayBuffer>,
    props: Uint8Array<ArrayBuffer>,
    size: number,
  ) {
    const stream = new Uint8Array(13 + input.length);
    const view = new DataView(stream.buffer);

    stream.set(props.subarray(0, 5));
    view.setBigUint64(5, BigInt(size), true);
    stream.set(input, 13);

    return new Uint8Array(this.lzma!.decompressSync(stream));
  }

  // raw lzma2 carries no dictionary size, so it comes from the coder's prop byte
  private async decodeLZMA2(
    input: Uint8Array<ArrayBuffer>,
    props: Uint8Array<ArrayBuffer>,
  ) {
    const bits = props[0];
    const dictSize =
      bits === 40 ? 0xffffffff : (2 | (bits & 1)) * 2 ** ((bits >>> 1) + 11);
    const output = this.lzma2!.decompressStream(new Blob([input]).stream(), {
      dictSize,
    });

    return new Uint8Array(await new Response(output).arrayBuffer());
  }
}
