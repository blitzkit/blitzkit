import { AbstractVFS } from "./abstract";

export class MixedVFS extends AbstractVFS {
  constructor(private vfses: AbstractVFS[]) {
    super();
  }

  async init() {
    for (const vfs of this.vfses) {
      await vfs.init();
    }

    return this;
  }

  dispose() {
    for (const vfs of this.vfses) {
      vfs.dispose();
    }
  }

  async has(path: string) {
    for (const vfs of this.vfses) {
      if (await vfs.has(path)) return true;
    }

    return false;
  }

  async raw(path: string) {
    for (const vfs of this.vfses) {
      if (await vfs.has(path)) return await vfs.raw(path);
    }

    throw new Error(`File not found: ${path}`);
  }

  async dir(path: string) {
    const files = new Set<string>();

    for (const vfs of this.vfses) {
      for (const file of await vfs.dir(path)) {
        files.add(file);
      }
    }

    return Array.from(files);
  }
}
