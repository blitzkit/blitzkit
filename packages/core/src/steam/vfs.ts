import { XMLParser } from "fast-xml-parser";
import SteamUser, { EConnectionProtocol } from "steam-user";
import { parse } from "yaml";
import { readDVPL } from "../blitz";

interface SteamManifestFile {
  chunks: {
    sha: string;
    crc: number;
    offset: string;
    cb_original: number;
    cb_compressed: number;
  }[];
  filename: string;
  size: string;
  flags: number;
  sha_filename: string;
  sha_content: string;
  linktarget: unknown;
}

interface SteamManifest {
  files: SteamManifestFile[];
  depot_id: number;
  gid_manifest: string;
  creation_time: number;
  filenames_encrypted: boolean;
  cb_disk_original: string;
  cb_disk_compressed: string;
  unique_chunks: number;
  crc_encrypted: number;
  crc_clear: number;
}

export class SteamVFS {
  private steam = new SteamUser({ protocol: EConnectionProtocol.TCP });
  private textDecoder = new TextDecoder();
  private xmlParser = new XMLParser();

  private manifest: Map<string, SteamManifestFile> = new Map();

  constructor(
    private username: string,
    private password: string,
    private app: number,
    private depot: number
  ) {}

  async init() {
    this.steam.logOn({
      accountName: this.username,
      password: this.password,
    });

    await new Promise((resolve) => this.steam.once("loggedOn", resolve));

    const productInfo = await this.steam.getProductInfo([this.app], []);
    const manifest: SteamManifest = await new Promise((resolve) => {
      // @ts-expect-error
      this.steam.getManifest(
        this.app,
        this.depot,
        productInfo.apps[this.app].appinfo.depots[this.depot].manifests.public
          .gid,
        "public",
        // @ts-expect-error
        (_, response) => {
          resolve(response);
        }
      );
    });

    const paths: string[] = [];
    for (const file of manifest.files) {
      const path = file.filename.replaceAll("\\", "/");
      paths.push(path);
      this.manifest.set(path, file);
    }

    return this;
  }

  has(path: string) {
    const dvplPath = `${path}.dvpl`;

    return (
      (this.manifest.has(dvplPath) && dvplPath) ||
      (this.manifest.has(path) && path)
    );
  }

  assert(requested: string) {
    const path = this.has(requested);

    if (!path) throw new Error(`File not found: ${requested}`);

    return path;
  }

  dir(path: string) {
    const parentSegments = path.split("/").length;
    const children: string[] = [];

    for (const child of this.manifest.keys()) {
      const childSegments = child.split("/");

      if (
        child.startsWith(path) &&
        parentSegments + 1 === childSegments.length
      ) {
        children.push(childSegments.at(-1)!);
      }
    }

    return children;
  }

  async file(requested: string) {
    const path = this.assert(requested);
    const fileManifest = this.manifest.get(path)!;
    const downloaded: { type: "complete"; file: Buffer } =
      // @ts-expect-error
      await this.steam.downloadFile(this.app, this.depot, fileManifest);
    let buffer = downloaded.file;

    if (path.endsWith(".dvpl")) buffer = readDVPL(downloaded.file);

    return new Uint8Array(buffer);
  }

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

  dispose() {
    this.steam.logOff();
  }

  [Symbol.dispose]() {
    this.dispose();
  }
}
