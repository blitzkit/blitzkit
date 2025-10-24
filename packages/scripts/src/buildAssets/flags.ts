import { readdir } from "fs/promises";
import sharp from "sharp";
import { readDVPLFile } from "../core/blitz/readDVPLFile";
import { AssetUploader } from "../core/github/assetUploader";
import { DATA } from "./constants";

export async function flags() {
  console.log("Building flags...");

  using uploader = new AssetUploader("flags");
  const circleFiles = await readdir(`${DATA}/Gfx/Lobby/flags`).then((files) =>
    files.filter(
      (flag) =>
        flag.startsWith("flag_profile-stat_") &&
        !flag.endsWith("@2x.packed.webp")
    )
  );
  const scratchedFiles = await readdir(`${DATA}/Gfx/Lobby/flags`).then(
    (files) =>
      files.filter(
        (flag) =>
          flag.startsWith("flag_tutor-tank_") &&
          !flag.endsWith("@2x.packed.webp")
      )
  );
  const fadedFiles = await readdir(`${DATA}/Gfx/Lobby/flags`).then((files) =>
    files.filter(
      (flag) =>
        flag.startsWith("flag_filter_") && flag.endsWith("@2x.packed.webp")
    )
  );

  for (const flag of circleFiles) {
    const image = sharp(await readDVPLFile(`${DATA}/Gfx/Lobby/flags/${flag}`));
    const content = await image.trim({ threshold: 100 }).toBuffer();
    const name = flag.match(/flag_profile-stat_(.+)\.packed\.webp/)![1];

    uploader.add({
      content,
      path: `flags/circle/${name}.webp`,
    });
  }

  for (const flag of scratchedFiles) {
    const content = await readDVPLFile(`${DATA}/Gfx/Lobby/flags/${flag}`);
    const name = flag.match(/flag_tutor-tank_(.+)\.packed\.webp/)![1];

    uploader.add({
      path: `flags/scratched/${name}.webp`,
      content,
    });
  }

  for (const flag of fadedFiles) {
    const content = await sharp(
      await readDVPLFile(`${DATA}/Gfx/Lobby/flags/${flag}`)
    )
      .trim({
        threshold: 100,
        background: { r: 0, g: 0, b: 0, alpha: 0 },
      })
      .toBuffer();
    const name = flag.match(/flag_filter_(.+)@2x\.packed\.webp/)![1];

    uploader.add({
      content,
      path: `flags/fade_small/${name}.webp`,
    });
  }

  await uploader.flush();
}
