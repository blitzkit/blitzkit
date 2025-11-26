import SteamUser, { EConnectionProtocol } from "steam-user";

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

  async file(path: string) {
    if (!this.manifest.has(path)) {
      throw new Error(`File not found: ${path}`);
    }

    const fileManifest = this.manifest.get(path)!;

    const downloaded: { type: "complete"; file: Buffer } =
      // @ts-expect-error
      await this.steam.downloadFile(this.app, this.depot, fileManifest);

    return new Uint8Array(downloaded.file);
  }

  dispose() {
    this.steam.logOff();
  }

  [Symbol.dispose]() {
    this.dispose();
  }
}
