import { ReadStream } from "./buffer";

export const SEVEN_ZIP_SIGNATURE_HEADER_SIZE = 32;

const SIGNATURE = [0x37, 0x7a, 0xbc, 0xaf, 0x27, 0x1c];

const enum Id {
  End = 0x00,
  Header = 0x01,
  ArchiveProperties = 0x02,
  AdditionalStreamsInfo = 0x03,
  MainStreamsInfo = 0x04,
  FilesInfo = 0x05,
  PackInfo = 0x06,
  UnpackInfo = 0x07,
  SubStreamsInfo = 0x08,
  Size = 0x09,
  CRC = 0x0a,
  Folder = 0x0b,
  CodersUnpackSize = 0x0c,
  NumUnpackStream = 0x0d,
  EmptyStream = 0x0e,
  EmptyFile = 0x0f,
  Name = 0x11,
  EncodedHeader = 0x17,
}

export interface SevenZipCoder {
  method: number;
  numIn: number;
  numOut: number;
  props: Uint8Array<ArrayBuffer>;
}

// a folder is one compressed block; only single coder, single file folders are ever decoded
export interface SevenZipFolder {
  coders: SevenZipCoder[];
  packedCount: number;
  firstPackStream: number;
  unpackSize: number;
  numUnpackStreams: number;
  crc?: number;
}

export interface SevenZipStreamsInfo {
  packPos: number;
  packSizes: number[];
  folders: SevenZipFolder[];
}

export interface SevenZipFileInfo {
  name: string;
  hasStream: boolean;
  isDir: boolean;
}

export class SevenZipReadStream extends ReadStream {
  signatureHeader() {
    const signature = this.consumeUint8Array(SIGNATURE.length);

    if (!SIGNATURE.every((byte, i) => signature[i] === byte)) {
      throw new Error("Not a 7z archive");
    }

    // format version
    this.seek(2);

    return {
      startHeaderCrc: this.uint32(),
      nextHeaderOffset: Number(this.uint64()),
      nextHeaderSize: Number(this.uint64()),
      nextHeaderCrc: this.uint32(),
    };
  }

  header() {
    const id = this.number();

    switch (id) {
      case Id.Header:
        return { encoded: false, ...this.mainHeader() } as const;

      // the real header is itself compressed and stored as a packed stream
      case Id.EncodedHeader:
        return { encoded: true, streams: this.streamsInfo() } as const;

      default:
        throw new Error(`7z: unexpected header id ${id}`);
    }
  }

  private mainHeader() {
    let streams: SevenZipStreamsInfo = {
      packPos: 0,
      packSizes: [],
      folders: [],
    };
    let files: SevenZipFileInfo[] = [];

    for (let id = this.number(); id !== Id.End; id = this.number()) {
      switch (id) {
        case Id.ArchiveProperties:
          while (this.number() !== Id.End) this.seek(this.number());
          break;

        case Id.AdditionalStreamsInfo:
          throw new Error("7z: additional streams are not supported");

        case Id.MainStreamsInfo:
          streams = this.streamsInfo();
          break;

        case Id.FilesInfo:
          files = this.filesInfo();
          break;

        default:
          throw new Error(`7z: unexpected header id ${id}`);
      }
    }

    return { streams, files };
  }

  private streamsInfo() {
    const info: SevenZipStreamsInfo = {
      packPos: 0,
      packSizes: [],
      folders: [],
    };

    for (let id = this.number(); id !== Id.End; id = this.number()) {
      switch (id) {
        case Id.PackInfo:
          this.packInfo(info);
          break;

        case Id.UnpackInfo:
          info.folders = this.unpackInfo();
          break;

        case Id.SubStreamsInfo:
          this.subStreamsInfo(info.folders);
          break;

        default:
          throw new Error(`7z: unexpected StreamsInfo id ${id}`);
      }
    }

    let packIndex = 0;

    for (const folder of info.folders) {
      folder.firstPackStream = packIndex;
      packIndex += folder.packedCount;
    }

    return info;
  }

  private packInfo(info: SevenZipStreamsInfo) {
    info.packPos = this.number();
    const count = this.number();

    for (let id = this.number(); id !== Id.End; id = this.number()) {
      switch (id) {
        case Id.Size:
          for (let i = 0; i < count; i++) info.packSizes.push(this.number());
          break;

        case Id.CRC:
          this.digests(count);
          break;

        default:
          throw new Error(`7z: unexpected PackInfo id ${id}`);
      }
    }
  }

  private unpackInfo() {
    if (this.number() !== Id.Folder) throw new Error("7z: expected Folder");

    const count = this.number();

    if (this.uint8() !== 0) {
      throw new Error("7z: external folders are not supported");
    }

    const folders: SevenZipFolder[] = [];
    for (let i = 0; i < count; i++) folders.push(this.folder());

    if (this.number() !== Id.CodersUnpackSize) {
      throw new Error("7z: expected CodersUnpackSize");
    }

    // every coder output has a size, but single coder folders only have the one
    for (const folder of folders) {
      const outputs = folder.coders.reduce(
        (sum, coder) => sum + coder.numOut,
        0,
      );

      folder.unpackSize = this.number();
      for (let i = 1; i < outputs; i++) this.number();
    }

    for (let id = this.number(); id !== Id.End; id = this.number()) {
      switch (id) {
        case Id.CRC:
          this.digests(count).forEach((crc, i) => (folders[i].crc = crc));
          break;

        default:
          throw new Error(`7z: unexpected UnpackInfo id ${id}`);
      }
    }

    return folders;
  }

  private folder() {
    const coderCount = this.number();
    const coders: SevenZipCoder[] = [];
    let totalIn = 0;
    let totalOut = 0;

    for (let i = 0; i < coderCount; i++) {
      const flags = this.uint8();

      if (flags & 0x80) {
        throw new Error("7z: alternative coder methods are not supported");
      }

      // method ids are big endian
      const method = this.consumeUint8Array(flags & 0x0f).reduce(
        (value, byte) => value * 0x100 + byte,
        0,
      );
      let numIn = 1;
      let numOut = 1;

      if (flags & 0x10) {
        numIn = this.number();
        numOut = this.number();
      }

      const props =
        flags & 0x20
          ? this.consumeUint8Array(this.number())
          : new Uint8Array(0);

      coders.push({ method, numIn, numOut, props });
      totalIn += numIn;
      totalOut += numOut;
    }

    // bind pairs and packed stream indices only matter for coder chains, so they're skipped
    const bindPairCount = totalOut - 1;
    const packedCount = totalIn - bindPairCount;

    for (let i = 0; i < bindPairCount * 2; i++) this.number();
    if (packedCount > 1) for (let i = 0; i < packedCount; i++) this.number();

    return {
      coders,
      packedCount,
      firstPackStream: 0,
      unpackSize: 0,
      numUnpackStreams: 1,
    } satisfies SevenZipFolder;
  }

  private subStreamsInfo(folders: SevenZipFolder[]) {
    for (let id = this.number(); id !== Id.End; id = this.number()) {
      switch (id) {
        case Id.NumUnpackStream:
          for (const folder of folders) folder.numUnpackStreams = this.number();
          break;

        // per file sizes only exist for solid folders, which are never read
        case Id.Size:
          for (const folder of folders) {
            for (let i = 1; i < folder.numUnpackStreams; i++) this.number();
          }
          break;

        // folders holding one file with a known crc have no digest here
        case Id.CRC: {
          const undigested = folders.filter(
            (folder) =>
              !(folder.numUnpackStreams === 1 && folder.crc !== undefined),
          );
          const total = undigested.reduce(
            (sum, folder) => sum + folder.numUnpackStreams,
            0,
          );
          const digests = this.digests(total);
          let index = 0;

          for (const folder of undigested) {
            if (folder.numUnpackStreams === 1) folder.crc = digests[index];
            index += folder.numUnpackStreams;
          }
          break;
        }

        default:
          throw new Error(`7z: unexpected SubStreamsInfo id ${id}`);
      }
    }
  }

  private filesInfo() {
    const count = this.number();
    const files: SevenZipFileInfo[] = Array.from({ length: count }, () => ({
      name: "",
      hasStream: true,
      isDir: false,
    }));
    let emptyStream: boolean[] | undefined;
    let emptyFile: boolean[] | undefined;

    for (let type = this.number(); type !== Id.End; type = this.number()) {
      const data = new SevenZipReadStream(this.consume(this.number()));

      switch (type) {
        case Id.EmptyStream:
          emptyStream = data.bits(count);
          break;

        case Id.EmptyFile:
          emptyFile = data.bits(emptyStream?.filter(Boolean).length ?? 0);
          break;

        // names are consecutive null terminated utf-16 strings
        case Id.Name: {
          if (data.uint8() !== 0) {
            throw new Error("7z: external names are not supported");
          }

          const names = new TextDecoder("utf-16le")
            .decode(data.consumeRemaining())
            .split("\0");

          files.forEach((file, i) => (file.name = names[i]));
          break;
        }

        // times, attributes, padding etc. are not needed
      }
    }

    let emptyIndex = 0;

    files.forEach((file, i) => {
      if (!emptyStream?.[i]) return;

      file.hasStream = false;
      file.isDir = !emptyFile?.[emptyIndex];
      emptyIndex++;
    });

    return files;
  }

  // 7z variable-length number: leading 1-bits in the first byte count extra bytes
  private number() {
    const first = this.uint8();
    let mask = 0x80;
    let value = 0;

    for (let i = 0; i < 8; i++) {
      if ((first & mask) === 0) {
        return value + (first & (mask - 1)) * 2 ** (8 * i);
      }

      value += this.uint8() * 2 ** (8 * i);
      mask >>>= 1;
    }

    return value;
  }

  private bits(count: number) {
    const result: boolean[] = [];
    let current = 0;
    let mask = 0;

    for (let i = 0; i < count; i++) {
      if (mask === 0) {
        current = this.uint8();
        mask = 0x80;
      }

      result.push((current & mask) !== 0);
      mask >>>= 1;
    }

    return result;
  }

  private digests(count: number) {
    const defined =
      this.uint8() !== 0
        ? new Array<boolean>(count).fill(true)
        : this.bits(count);

    return defined.map((isDefined) => (isDefined ? this.uint32() : undefined));
  }
}
