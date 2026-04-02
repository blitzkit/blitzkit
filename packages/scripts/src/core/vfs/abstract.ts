import { readDVPL } from "@blitzkit/core";
import { XMLParser } from "fast-xml-parser";
import { normalize } from "path/posix";
import { parse } from "yaml";

export abstract class AbstractVFS {
  textDecoder = new TextDecoder();
  private xmlParser = new XMLParser();

  abstract init(): Promise<typeof this>;

  abstract dispose(): void;

  abstract has(path: string): Promise<boolean>;

  abstract raw(path: string): Promise<Uint8Array>;

  async resolve(path: string) {
    const normalized = normalize(path);
    if (await this.has(normalized)) return normalized;

    const dvplPath = `${normalized}.dvpl`;
    if (await this.has(dvplPath)) return dvplPath;

    return null;
  }

  async assert(path: string) {
    const resolved = await this.resolve(path);

    if (resolved === null) throw new Error(`File not found: ${path}`);

    return resolved;
  }

  async file(file: string) {
    const resolved = await this.assert(file);
    const raw = await this.raw(resolved);
    let buffer = raw;

    if (resolved.endsWith(".dvpl")) {
      buffer = new Uint8Array(readDVPL(Buffer.from(raw)));
    }

    return buffer;
  }

  abstract dir(path: string): Promise<string[]>;

  async text(path: string) {
    const file = await this.file(path);
    return this.textDecoder.decode(file);
  }

  async yaml<Type>(path: string) {
    const file = await this.text(path);
    return parse(file) as Type;
  }

  async xml<Type>(path: string) {
    const file = await this.text(path);
    return this.xmlParser.parse(file) as Type;
  }

  [Symbol.dispose]() {
    this.dispose();
  }
}
