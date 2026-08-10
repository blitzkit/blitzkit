import { $ } from "bun";
import { mkdir, rm } from "node:fs/promises";

export class GitObjectStorage {
  constructor(
    private repo: string,
    private base: string,
    private token?: string,
  ) {}

  async init() {
    await rm(this.base, { recursive: true, force: true });

    console.log(`Cloning ${this.repo} to ${this.base}`);

    const url = this.token
      ? `https://x-access-token:${this.token}@github.com/${this.repo}.git`
      : `https://github.com/${this.repo}.git`;

    await $`git clone --depth 1 ${url} ${this.base}`;

    return this;
  }

  async commit() {
    const shell = $.cwd(this.base);

    await shell`git add .`.quiet();
    await shell`git commit --amend --reset-author -m "ids update ${new Date().toISOString()}"`.quiet();
    await shell`git push --force-with-lease`;
  }

  async mkdir(path: string) {
    await mkdir(`${this.base}/${path}`, { recursive: true });
  }

  async rm(path: string) {
    await rm(`${this.base}/${path}`, { force: true });
  }

  async write(path: string, bytes: Uint8Array | string) {
    await Bun.write(`${this.base}/${path}`, bytes);
  }

  file(path: string) {
    return Bun.file(`${this.base}/${path}`);
  }

  async bytes(path: string) {
    const file = this.file(path);
    return await file.bytes();
  }

  async json<Type>(path: string) {
    const file = this.file(path);
    return (await file.json()) as Type;
  }
}
