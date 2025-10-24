import { assertSecret } from "@blitzkit/core";
import { chunk } from "lodash-es";
import { commitMultipleFiles, FileChange } from "./commitMultipleFiles";

export async function commitAssets(message: string, changes: FileChange[]) {
  console.log(`Committing ${message}...`);

  if (changes.length === 0) return;

  const chunks = chunk(changes, 64);
  let chunkIndex = 0;

  for (const chunk of chunks) {
    console.log(`Committing chunk ${chunkIndex + 1}/${chunks.length}`);

    await commitMultipleFiles(
      assertSecret(import.meta.env.PUBLIC_ASSET_REPO),
      assertSecret(import.meta.env.PUBLIC_ASSET_BRANCH),
      `${message} - ${new Date().toDateString()} (${chunkIndex + 1}/${
        chunks.length
      })`,
      chunk
    );

    chunkIndex++;
  }
}
