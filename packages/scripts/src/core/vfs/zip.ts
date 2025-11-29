import { HTTPRangeReader, unzip, ZipEntry } from "unzipit";
import { AbstractVFS } from "./abstract";

export class ZipVFS extends AbstractVFS {
  entries: Record<string, ZipEntry> = {};

  constructor(private url: string, private root = "app/") {
    super();
  }

  async init() {
    const reader = new HTTPRangeReader(this.url);
    const { entries } = await unzip(reader);

    for (const entry of Object.values(entries)) {
      this.entries[entry.name.slice(this.root.length)] = entry;
    }

    return this;
  }
}
