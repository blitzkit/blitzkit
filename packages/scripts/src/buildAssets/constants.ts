import { readdir } from "fs/promises";
import { argv } from "process";

const WINDOWS_APPS = "C:/Program Files/WindowsApps";
const wotbPackageRegex = /7458BE2C\..+_\d+(\.\d+)+_x64__.+/;

const isManual = argv.includes("--manual");

let data: string;
let compressed: boolean;

if (isManual) {
  data = "../../temp/game/Data";
  compressed = true;
} else {
  const directories = await readdir(WINDOWS_APPS).then((files) =>
    files.filter((file) => wotbPackageRegex.test(file))
  );

  if (directories.length !== 1) {
    throw new Error(
      `Expected 1 directory for WoTB Windows App, got ${directories.length}.`
    );
  }

  const [windowsApp] = directories;
  data = `${WINDOWS_APPS}/${windowsApp}/Data`;
  compressed = false;
}

export const DATA = data;
export const DATA_COMPRESSED = compressed;
