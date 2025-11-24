export enum BlitzVFSSourceType {
  Steam,
}

type BlitzVFSSource = {
  type: BlitzVFSSourceType;

  username: string;
  password: string;

  app: number;
  os: "windows";
};

export class BlitzVFS {
  constructor(private source: BlitzVFSSource) {}

  async init() {
    return this;
  }

  async file(path: string) {
    return new Uint8Array();
  }
}
