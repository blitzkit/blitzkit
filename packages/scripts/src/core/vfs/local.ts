import { readdir } from "node:fs/promises";
import { AbstractVFS } from "./abstract";

export class LocalVFS extends AbstractVFS {
  constructor(private base: string) {
    super();
  }

  async init() {
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

  async dir(path: string) {
    return await readdir(`${this.base}/${path}`);
  }

  dispose() {}
}
