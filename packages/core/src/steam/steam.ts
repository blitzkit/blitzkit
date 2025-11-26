import { writeFile } from "fs/promises";
import { normalize } from "path";
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
      this.steam.getManifest(
        this.app,
        this.depot,
        productInfo.apps[this.app].appinfo.depots[this.depot].manifests.public
          .gid,
        "public",
        (_, response) => {
          resolve(response);
        }
      );
    });

    let str = "";
    for (const file of manifest.files) {
      const path = normalize(file.filename);
      str += `${path}\n`;
      this.manifest.set(path, file);
    }

    writeFile("test.txt", str);

    console.log(JSON.stringify(manifest.files[0], null, 2));
  }
}
