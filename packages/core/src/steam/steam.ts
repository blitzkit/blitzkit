import SteamUser, { EConnectionProtocol } from "steam-user";

interface SteamManifest {
  files: {
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
  }[];
}

export class SteamVFS {
  private steam = new SteamUser({ protocol: EConnectionProtocol.TCP });

  private manifest: SteamManifest;

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
    const manifest = await new Promise((resolve) => {
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

    console.log(JSON.stringify(manifest.files[0], null, 2));
  }
}
