import { execFile } from "child_process";
import { existsSync } from "fs";
import { mkdir, readdir, rm, writeFile } from "fs/promises";

const TS_PROTO_EXECUTABLE_LOCATIONS = [
  "./node_modules/.bin/protoc-gen-ts_proto",
  "../../node_modules/.bin/protoc-gen-ts_proto",
];
const ROOTS = [
  "../../packages/closed/protos",
  "../../packages/website-ue/src/protos",
];

let tsProtoExecutableLocation: string | undefined = undefined;

for (const location of TS_PROTO_EXECUTABLE_LOCATIONS) {
  if (existsSync(location)) {
    tsProtoExecutableLocation = location;
    break;
  } else if (existsSync(`${location}.exe`)) {
    tsProtoExecutableLocation = `${location}.exe`;
    break;
  }
}

if (!tsProtoExecutableLocation) {
  throw new Error(
    `Could not find ts-proto executable. Checked locations: ${TS_PROTO_EXECUTABLE_LOCATIONS.join(
      ", "
    )}`
  );
}

await mkdir("temp", { recursive: true });

for (const root of ROOTS) {
  let args = "";

  for (const include of ROOTS) {
    args += `-I=${include}\n`;
  }

  args += `--plugin=${tsProtoExecutableLocation}\n`;
  args += "--ts_proto_opt=esModuleInterop=true\n";
  args += "--ts_proto_opt=oneof=unions-value\n";
  args += "--ts_proto_opt=unrecognizedEnum=false\n";
  args += "--ts_proto_opt=snakeToCamel=false\n";
  args += `--ts_proto_out=${root}\n`;

  const filesRaw = await readdir(`${root}`);
  const files: string[] = [];

  for (const file of filesRaw) {
    if (file.endsWith(".proto")) {
      files.push(file);
      args += `${root}/${file}\n`;
    }

    if (file.endsWith(".ts")) await rm(`${root}/${file}`);
  }

  await writeFile("temp/protoc.txt", args);
  execFile("protoc", ["@temp/protoc.txt"], (error, stdout, stderr) => {
    if (error) return console.error(`error: ${error.message}`);
    if (stderr) return console.error(`stderr: ${stderr}`);
    console.log(`stdout: ${stdout}`);
  });
}
