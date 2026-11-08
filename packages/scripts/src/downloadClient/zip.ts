import { assertSecret } from "@blitzkit/core";
import { $ } from "bun";
import { mkdir } from "node:fs/promises";
import { dir } from ".";

export async function downloadZipClient() {
  const url = assertSecret(import.meta.env.CLIENT_SOURCE);

  console.log("Downloading and extracting zipped client...");

  await mkdir(dir, { recursive: true });
  await $`curl -L "${url}" | bsdtar -xf- --strip-components=1 -C ${dir}`;
}
