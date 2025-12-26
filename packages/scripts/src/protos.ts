import { exec as execSync } from "child_process";
import { existsSync } from "fs";
import { readdir, rm } from "fs/promises";
import { promisify } from "util";

const MAX_COMMAND_LENGTH = 2 ** 11;
const TS_PROTO_EXECUTABLE_LOCATIONS = [
  "./node_modules/.bin/protoc-gen-ts_proto",
  "../../node_modules/.bin/protoc-gen-ts_proto",
];

const roots = [
  // "../../packages/core/src/protos",
  "../../packages/closed/protos",
  "../../packages/website-ue/src/protos",
];

const exec = promisify(execSync);

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

for (const root of roots) {
  const filesRaw = await readdir(`${root}`);
  const files: string[] = [];

  for (const file of filesRaw) {
    if (file.endsWith(".proto")) files.push(file);
    if (file.endsWith(".ts")) await rm(`${root}/${file}`);
  }

  while (files.length > 0) {
    let command = [
      "protoc",
      `--plugin=${tsProtoExecutableLocation}`,
      "--ts_proto_opt=esModuleInterop=true",
      "--ts_proto_opt=oneof=unions-value",
      // "--ts_proto_opt=removeEnumPrefix=true",
      "--ts_proto_opt=unrecognizedEnum=false",
      "--ts_proto_opt=snakeToCamel=false",
      `--ts_proto_out=${root}`,
      ...roots.map((root) => `-I=${root}`),
    ].join(" ");

    while (true) {
      if (files.length === 0) break;

      const file = files.at(-1);
      const newLine = ` ${root}/${file}`;

      if (command.length + newLine.length < MAX_COMMAND_LENGTH) {
        const file = files.pop();
        command += newLine;
        // console.log(`  ${file}`);
      } else {
        break;
      }
    }

    await exec(command);
  }
}
