import { AbstractVFS } from "../abstract";
import { SevenZipArchive, type SevenZipEntry } from "./archive";
import { HTTPMultiRangeReader } from "./rangeReader";

/**
 * Reads a 7z archive straight from the CDN with HTTP range requests.
 * Split volumes (.001, .002, ...) are raw byte slices of one archive, so they
 * are stitched into a single virtual address space.
 *
 * Only non-solid archives (one block per file) are supported, so reading a file
 * costs exactly one range request of its packed size.
 */
export class SevenZipVFS extends AbstractVFS {
  entries = new Map<string, SevenZipEntry>();
  private archive!: SevenZipArchive;

  constructor(private source: string) {
    super();
  }

  async _init() {
    const urls: string[] = [];

    // split volumes are suffixed .001, .002, ... until the cdn 404s
    for (let index = 1; ; index++) {
      const url = `${this.source}.${index.toString().padStart(3, "0")}`;
      const response = await fetch(url, { method: "HEAD" });

      if (response.status === 404) break;

      if (!response.ok) {
        throw new Error(`Wargaming response error status: ${response.status}`);
      }

      urls.push(url);
    }

    if (urls.length === 0) throw new Error(`No volumes at ${this.source}`);

    const reader = await new HTTPMultiRangeReader(urls).init();
    this.archive = await SevenZipArchive.open(reader);

    for (const entry of this.archive.entries) {
      if (entry.isDir) continue;

      this.entries.set(this.normalizePath!(entry.name), entry);
    }

    return this;
  }

  async has(path: string) {
    return this.entries.has(path);
  }

  async raw(path: string) {
    console.log(path);
    const entry = this.entries.get(path);
    if (!entry) throw new Error(`File not found in 7z: ${path}`);
    return this.archive.read(entry);
  }

  async _dir(path: string) {
    const parentSegments = path.split("/").length;
    const children = new Set<string>();

    for (const child of this.entries.keys()) {
      if (!child.startsWith(path) || child === path) continue;

      const childSegments = child.split("/");
      const nextSegment = childSegments[parentSegments];

      children.add(nextSegment);
    }

    return Array.from(children);
  }

  dispose() {}
}
