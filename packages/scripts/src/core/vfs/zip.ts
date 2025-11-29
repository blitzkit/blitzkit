import { normalize } from "path/posix";
import { HTTPRangeReader, unzip, ZipEntry } from "unzipit";
import { AbstractVFS } from "./abstract";

export class ZipVFS extends AbstractVFS {
  entries = new Map<string, ZipEntry>();

  constructor(private url: string, private root = "app/") {
    super();
  }

  async init() {
    const reader = new HTTPRangeReader(this.url);
    const { entries } = await unzip(reader);

    for (const entry of Object.values(entries)) {
      const normalized = normalize(entry.name.slice(this.root.length));
      this.entries.set(normalized, entry);
    }

    return this;
  }

  has(path: string) {
    return path in this.entries;
  }

  async raw(path: string) {
    const arrayBuffer = await this.entries.get(path)!.arrayBuffer();
    return new Uint8Array(arrayBuffer);
  }

  paths() {
    return Array.from(this.entries.keys());
  }

  dispose() {}
}
