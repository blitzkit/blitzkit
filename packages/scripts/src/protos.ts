import { exec as execSync } from "child_process";
import { existsSync } from "fs";
import { readdir, rm } from "fs/promises";
import { promisify } from "util";

const MAX_COMMAND_LENGTH = 2 ** 11;

const roots = [
  // "packages/core/src/protos",
  "submodules/blitzkit-closed/protos",
];

const exec = promisify(execSync);

let executableFileExtension: string;

if (existsSync("node_modules/.bin/protoc-gen-ts_proto.exe")) {
  executableFileExtension = ".exe";
} else {
  executableFileExtension = "";
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
      `--plugin=./node_modules/.bin/protoc-gen-ts_proto${executableFileExtension}`,
      "--ts_proto_opt=esModuleInterop=true",
      "--ts_proto_opt=oneof=unions-value",
      // "--ts_proto_opt=removeEnumPrefix=true",
      "--ts_proto_opt=unrecognizedEnum=false",
      "--ts_proto_opt=snakeToCamel=false",
      `--ts_proto_out=${root}`,
      `-I=${root}`,
    ].join(" ");

    while (true) {
      if (files.length === 0) break;

      const file = files.at(-1);
      const newLine = ` ${root}/${file}`;

      if (command.length + newLine.length < MAX_COMMAND_LENGTH) {
        command += newLine;
        files.pop();
      } else {
        break;
      }
    }

    await exec(command);
  }
}
