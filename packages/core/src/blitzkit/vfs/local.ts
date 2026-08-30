import type { readdir } from "node:fs/promises";
import { AbstractVFS } from "./abstract";

export class LocalVFS extends AbstractVFS {
  protected readdir?: typeof readdir;

  constructor(private base: string) {
    super();
  }

  async _init() {
    const path = await import("node:path/posix");
    this.normalizePath = path.normalize;

    return this;
  }

  async has(path: string) {
    const file = Bun.file(`${this.base}/${path}`);
    return await file.exists();
  }

  async raw(path: string) {
    const file = Bun.file(`${this.base}/${path}`);
    const buffer = await file.arrayBuffer();
    const array = new Uint8Array(buffer);

    return array;
  }

  async _dir(path: string) {
    try {
      return await this.readdir!(`${this.base}/${path}`);
    } catch (_) {
      return [];
    }
  }

  dispose() {}
}
