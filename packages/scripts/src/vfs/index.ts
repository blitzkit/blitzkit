import { assertSecret } from "@blitzkit/core";
import { LocalVFS } from "@blitzkit/core/src/blitzkit/vfs/local";

export const vfs = new LocalVFS(assertSecret(import.meta.env.CLIENT_DIR));

const command = Bun.argv[2];
const path = Bun.argv[3];

if (!path) {
  console.error("Gimme a path to assess dumb ass");
  process.exit(1);
}

if (command === "cat") {
  const content = await vfs.file(path);
  await Bun.write(Bun.stdout, content);
} else if (command === "ls") {
  const files = await vfs.dir(path);

  for (const file of files) {
    console.log(file);
  }
}
