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

// for (const root of ROOTS) {
//   const filesRaw = await readdir(`${root}`);
//   const files: string[] = [];

//   for (const file of filesRaw) {
//     if (file.endsWith(".proto")) files.push(file);
//     if (file.endsWith(".ts")) await rm(`${root}/${file}`);
//   }

//   while (files.length > 0) {
//     let command = [
//       "protoc",
//       `--plugin=${tsProtoExecutableLocation}`,
//       "--ts_proto_opt=esModuleInterop=true",
//       "--ts_proto_opt=oneof=unions-value",
//       // "--ts_proto_opt=removeEnumPrefix=true",
//       "--ts_proto_opt=unrecognizedEnum=false",
//       "--ts_proto_opt=snakeToCamel=false",
//       `--ts_proto_out=${root}`,
//       ...ROOTS.map((root) => `-I=${root}`),
//     ].join(" ");

//     while (true) {
//       if (files.length === 0) break;

//       const file = files.at(-1);
//       const newLine = ` ${root}/${file}`;

//       if (command.length + newLine.length < MAX_COMMAND_LENGTH) {
//         const file = files.pop();
//         command += newLine;
//         // console.log(`  ${file}`);
//       } else {
//         break;
//       }
//     }

//     await exec(command);
//   }
// }

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
    if (file.endsWith(".proto")) files.push(file);
    if (file.endsWith(".ts")) await rm(`${root}/${file}`);
  }

  await writeFile("temp/protoc.txt", args);
  execFile("protoc", ["@temp/protoc.txt"]);
}
