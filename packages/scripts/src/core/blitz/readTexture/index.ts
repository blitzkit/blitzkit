import { DdsReadStream, PvrReadStream } from "@blitzkit/core";
import { existsSync } from "fs";
import { DATA_COMPRESSED } from "../../../buildAssets/constants";
import { readDVPLFile } from "../readDVPLFile";

export async function readTexture(path: string) {
  const ddsTexturePath = path.replace(".tex", ".dx11.dds");
  const isDds = existsSync(
    `${ddsTexturePath}${DATA_COMPRESSED ? ".dvpl" : ""}`
  );
  const resolvedTexturePath = isDds
    ? ddsTexturePath
    : ddsTexturePath.replace(".dds", ".pvr");
  const decompressedDvpl = await readDVPLFile(`${resolvedTexturePath}.dvpl`);

  const raw = isDds
    ? await new DdsReadStream(decompressedDvpl.buffer as ArrayBuffer).dds()
    : new PvrReadStream(decompressedDvpl.buffer as ArrayBuffer).pvr();

  return raw;

  // switch (mutation) {
  //   case TextureMutation.Normal: {
  //     const bytes = 4 * raw.width * raw.height;
  //     for (let index = 0; index < bytes; index += 4) {
  //       /**
  //        * Red is always 255 and blue is always 0. Only alpha and green contain any
  //        * sort of information.
  //        */
  //       let x = raw.data[index + 3] * (2 / 255) - 1;
  //       let y = raw.data[index + 1] * (2 / 255) - 1;
  //       const underSqrt = 1 - x ** 2 - y ** 2;
  //       let z = underSqrt > 0 ? Math.sqrt(underSqrt) : -Math.sqrt(-underSqrt);

  //       raw.data[index] = Math.round((x + 1) * (255 / 2));
  //       raw.data[index + 1] = Math.round((y + 1) * (255 / 2));
  //       raw.data[index + 2] = Math.round((z + 1) * (255 / 2));
  //       raw.data[index + 3] = 255;
  //     }

  //     return await sharp(raw.data, { raw }).jpeg().toBuffer();
  //   }

  //   case TextureMutation.RoughnessMetallicness: {
  //     const newImage = sharp(Buffer.alloc(raw.width * raw.height), {
  //       raw: { ...raw, channels: 1 },
  //     });
  //     const metallicness = sharp(raw.data, { raw })
  //       .extractChannel("green")
  //       .jpeg()
  //       .toBuffer();
  //     const roughness = sharp(raw.data, { raw })
  //       .extractChannel("alpha")
  //       .jpeg()
  //       .toBuffer();

  //     return await newImage
  //       .joinChannel(await Promise.all([roughness, metallicness]))
  //       .jpeg()
  //       .toBuffer();
  //   }

  //   case TextureMutation.Miscellaneous: {
  //     /**
  //      * Alpha is ambient occlusion and green is emissive. But very few tanks
  //      * use emissive so I am ignoring it for now.
  //      */
  //     return await sharp(raw.data, { raw })
  //       .extractChannel("alpha")
  //       .jpeg()
  //       .toBuffer();
  //   }

  //   case TextureMutation.Albedo: {
  //     return await sharp(raw.data, { raw }).removeAlpha().jpeg().toBuffer();
  //   }

  //   default:
  //     return await sharp(raw.data, { raw }).jpeg().toBuffer();
  // }
}
