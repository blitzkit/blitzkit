import { DdsReadStream, PvrReadStream } from "@blitzkit/core";
import { vfs } from "../../../buildAssets/constants";

export async function readTexture(path: string) {
  const ddsTexturePath = path.replace(".tex", ".dx11.dds");
  const isDds = vfs.has(ddsTexturePath);
  const resolvedTexturePath = isDds
    ? ddsTexturePath
    : ddsTexturePath.replace(".dds", ".pvr");
  const decompressedDvpl = await vfs.file(`${resolvedTexturePath}.dvpl`);

  const raw = isDds
    ? await new DdsReadStream(decompressedDvpl.buffer as ArrayBuffer).dds()
    : new PvrReadStream(decompressedDvpl.buffer as ArrayBuffer).pvr();

  return raw;
}
