import decompress from "decompress";
import { existsSync } from "fs";
import { mkdir, readdir, writeFile } from "fs/promises";

if (!existsSync("../../temp")) {
  console.log("Creating temp directory...");
  await mkdir("../../temp");
}

console.log("Downloading depot downloader...");
await fetch(
  "https://api.github.com/repos/SteamRE/DepotDownloader/releases/latest"
)
  .then(
    (response) =>
      response.json() as Promise<{
        assets: { browser_download_url: string; name: string }[];
      }>
  )
  .then(({ assets }) => {
    const asset = assets.find(({ name }) => name.includes("linux-x64"));
    if (!asset) throw new Error("No asset found");
    return fetch(asset.browser_download_url);
  })
  .then((response) => response.arrayBuffer())
  .then((arrayBuffer) =>
    writeFile("../../temp/depotDownloader.zip", new Uint8Array(arrayBuffer))
  );

console.log("Unzipping...");
await decompress(
  "../../temp/depotDownloader.zip",
  "../../temp/depotDownloader"
);

console.log(
  "Download complete; files:",
  await readdir("../../temp/depotDownloader")
);
