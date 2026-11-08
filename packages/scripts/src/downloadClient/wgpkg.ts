import { $ } from "bun";
import { mkdir, rm } from "node:fs/promises";
import { dir, source } from ".";
import { WGPKG_DIR } from "./constants";

export async function downloadWGPKGClient() {
  let index = 1;
  const urls: string[] = [];

  console.log("Discovering packages...");

  while (true) {
    const url = `${source}.${index.toString().padStart(3, "0")}`;
    const response = await fetch(url);

    if (response.status === 200) {
      urls.push(url);
    } else if (response.status === 404) {
      break;
    } else {
      throw new Error(`Wargaming response error status: ${response.status}`);
    }

    index++;
  }

  console.log(`Downloading ${urls.length} packages...`);

  await rm(WGPKG_DIR, { recursive: true, force: true });
  await mkdir(WGPKG_DIR, { recursive: true });

  const inputContent = urls
    .map((url) => {
      const name = url.split("/").pop()!;
      return `${url}\n  out=${name}\n  dir=${WGPKG_DIR}`;
    })
    .join("\n");

  await $`echo ${inputContent} | aria2c -j ${urls.length} -x 2 -s 2 -i -`;

  const firstChunk = `${WGPKG_DIR}/${urls[0].split("/").pop()!}`;
  await $`7z x "${firstChunk}" -o${dir} -y`;

  await rm(WGPKG_DIR, { recursive: true });
}
