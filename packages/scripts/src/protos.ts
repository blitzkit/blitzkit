import { execFile } from "child_process";
import { mkdir, readdir, rm, writeFile } from "fs/promises";

const TEMP = "../../temp";
const TS_PROTO_EXECUTABLE = "../../node_modules/.bin/protoc-gen-ts_proto";
const ROOTS = ["../protos/src/blitzkit"];

for (const root of ROOTS) {
  await mkdir(TEMP, { recursive: true });

  let args = "";

  args += `--plugin=${TS_PROTO_EXECUTABLE}\n`;
  args += "--ts_proto_opt=esModuleInterop=true\n";
  args += "--ts_proto_opt=oneof=unions-value\n";
  args += "--ts_proto_opt=unrecognizedEnum=false\n";
  args += "--ts_proto_opt=snakeToCamel=false\n";
  args += `--ts_proto_out=${root}\n`;

  for (const dir of ROOTS) {
    args += `-I=${dir}\n`;
  }

  const filesRaw = await readdir(`${root}`, { recursive: true });
  const files: string[] = [];

  let index = "";
  index += "// @ts-nocheck\n";

  for (const file of filesRaw) {
    if (file.endsWith(".proto")) {
      const name = file.slice(0, -6);

      index += `export * from "./${name}";\n`;
      args += `${root}/${file}\n`;

      files.push(file);
    }

    if (file.endsWith(".ts")) {
      await rm(`${root}/${file}`);
    }
  }

  await writeFile(`${TEMP}/protoc.txt`, args);

  execFile("protoc", [`@${TEMP}/protoc.txt`], (error, stdout, stderr) => {
    if (error) throw new Error(error.message);
    if (stderr) console.error(stderr);
    if (stdout) console.log(stdout);
  });

  await writeFile(`${root}/index.ts`, index);
}
