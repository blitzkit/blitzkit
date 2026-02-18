import { build } from "esbuild";
import { cp, readdir, rm } from "fs/promises";
import { argv } from "process";

const dev = argv.includes("--dev");

const projectDir = "../..";
const srcRoot = `${projectDir}/packages/bot`;
const distRoot = `${projectDir}/dist/bot`;
const modulesRoot = dev
  ? "../../packages/bot/node_modules"
  : "../../node_modules";
const workers = await readdir(`${srcRoot}/src/workers`);

await rm(distRoot, { recursive: true, force: true });

build({
  entryPoints: [
    `${srcRoot}/src/main.ts`,
    ...workers.map((worker) => `${srcRoot}/src/workers/${worker}`),
  ],
  bundle: true,
  outdir: "../../dist/bot",
  platform: "node",
  format: "esm",
  loader: {
    ".ttf": "file",
    ".node": "empty",
    ".json": "json",
  },
  external: ["sharp"],
  minifyIdentifiers: false, // causes goofy ahh issues
  minifySyntax: !dev,
  minifyWhitespace: !dev,
  sourcemap: !dev,
  jsxImportSource: "react",
  jsx: "automatic",
});

for (const module of await readdir(`${modulesRoot}/@resvg`)) {
  readdir(`${modulesRoot}/@resvg/${module}`).then((files) =>
    files
      .filter((file) => file.endsWith(".node"))
      .map((file) =>
        cp(
          `${modulesRoot}/@resvg/${module}/${file}`,
          `${distRoot}/workers/${file}`,
        ),
      ),
  );
}

if (!dev) {
  await cp(`${projectDir}/prisma`, `${distRoot}/prisma`, { recursive: true });

  for (const file of await readdir(`${modulesRoot}/prisma`).then((files) =>
    files.filter((file) => file.endsWith(".node")),
  )) {
    cp(`${modulesRoot}/prisma/${file}`, `${distRoot}/prisma/${file}`);
  }
}
