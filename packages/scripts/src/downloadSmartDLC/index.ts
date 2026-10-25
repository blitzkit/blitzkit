import { dvp } from "@blitzkit/closed";
import { assertSecret } from "@blitzkit/core";
import { mkdir, writeFile } from "fs/promises";
import { parse as parsePath } from "path";
import { parse as parseYaml, stringify as stringifyYaml } from "yaml";
import { vfs } from "../vfs/vfs";

const CLIENT_DIR = assertSecret(import.meta.env.CLIENT_DIR);

const versionTextFile = await vfs.text(`Data/version.txt`);
const currentVersion = versionTextFile
  .split(" ")[0]
  .split(".")
  .slice(0, 3)
  .join(".");

console.log(`Installing patches for ${currentVersion}...`);

let patchIndex = 1;
while (true) {
  const response = await fetch(
    `${assertSecret(
      import.meta.env.WOTB_DLC_CDN,
    )}/dlc/s${currentVersion}_${patchIndex}.yaml`,
  );

  console.log(patchIndex, response.status);

  if (!response.ok) break;

  console.log(`Applying patch ${patchIndex}...`);

  const data = parseYaml(await response.text());
  const dvpm = await fetch(
    `${assertSecret(import.meta.env.WOTB_DLC_CDN)}/dlc/${data.dx11}`,
  ).then((response) => response.arrayBuffer());
  const dvpd = await fetch(
    `${assertSecret(import.meta.env.WOTB_DLC_CDN)}/dlc/${data.dx11.replace(
      ".dvpm",
      ".dvpd",
    )}`,
  ).then((response) => response.arrayBuffer());
  const files = await dvp(dvpm, dvpd);

  for (const { path, data } of files) {
    console.log(`Patching "${path}"...`);

    const { dir } = parsePath(path);

    await mkdir(`${CLIENT_DIR}/Data/${dir}`, { recursive: true });

    const buffer = Buffer.from(data);

    await writeFile(`${CLIENT_DIR}/Data/${path}`, new Uint8Array(buffer));
  }

  console.log("patches done for patch");

  if ("dynamicContentLocalizationsDir" in data) {
    console.log(
      `${assertSecret(import.meta.env.WOTB_DLC_CDN)}/dlc/${
        data.dynamicContentLocalizationsDir
      }/en.yaml`,
    );
    const localizationsResponse = await fetch(
      `${assertSecret(import.meta.env.WOTB_DLC_CDN)}/dlc/${
        data.dynamicContentLocalizationsDir
      }/en.yaml`,
    );
    console.log("fetched");
    const newStrings = parseYaml(await localizationsResponse.text());
    console.log("got new strings");
    const oldStrings =
      await vfs.yaml<Record<string, string>>(`Data/Strings/en.yaml`);
    console.log("got old strings");
    const patchedStrings = { ...oldStrings, ...newStrings };
    const patchedContent = stringifyYaml(patchedStrings);
    console.log("stringified");

    await mkdir(`${CLIENT_DIR}/Data/Strings`, { recursive: true });
    console.log("mkdir");
    await writeFile(
      `${CLIENT_DIR}/Data/Strings/en.yaml`,
      new Uint8Array(Buffer.from(patchedContent)),
    );
    console.log("file");
  }

  patchIndex++;
}

vfs.dispose();
process.exit(0);
