import { asset } from "@blitzkit/core";
import ProgressBar from "progress";
import { compareUint8Arrays } from "./compareUint8Arrays";
import { type GithubChangeBlob, createBlob } from "./createBlob";
import { octokit } from "./octokit";

export interface FileChange {
  path: string;
  content: Uint8Array;
}

enum DiffStatus {
  New,
  Changed,
  Unchanged,
}

const heuristicFormats = ["glb", "webp", "jpg", "png"];

export async function commitMultipleFiles(
  repoRaw: string,
  branch: string,
  message: string,
  changesRaw: FileChange[]
) {
  const changes: FileChange[] = [];

  await Promise.all(
    changesRaw.map(async (change) => {
      const response = await fetch(asset(change.path), {
        headers: { "Accept-Encoding": "identity" },
      });
      let diff: { change: number; status: DiffStatus };

      if (response.status === 404) {
        diff = { change: change.content.length, status: DiffStatus.New };
      } else if (
        response.headers.has("Content-Length") &&
        Number(response.headers.get("Content-Length")) !== change.content.length
      ) {
        diff = {
          change:
            change.content.length -
            Number(response.headers.get("Content-Length")),
          status: DiffStatus.Changed,
        };
      } else if (response.status === 200) {
        if (
          heuristicFormats.some((format) => change.path.endsWith(`.${format}`))
        ) {
          /**
           * Heuristic: if it's a large blob like a .glb, a diff = 0 might end
           * up being a false positive with isDifferent = true. So, it's okay
           * to assume it's unchanged.
           */
          diff = { change: 0, status: DiffStatus.Unchanged };
        } else {
          const buffer = new Uint8Array(await response.arrayBuffer());

          if (compareUint8Arrays(buffer, change.content)) {
            diff = { change: 0, status: DiffStatus.Unchanged };
          } else {
            diff = {
              change: change.content.length - buffer.length,
              status: DiffStatus.Changed,
            };
          }
        }
      } else {
        throw new Error(
          `Unexpected status code ${response.status} for ${change.path}`
        );
      }

      if (diff.status === DiffStatus.Unchanged) {
        // just don't bother
        // console.log(`🔵 (${diff.change.toLocaleString()}B) ${change.path}`);
      } else {
        console.log(
          `${
            diff.status === DiffStatus.New ? "🟢" : "🟡"
          } (${diff.change > 0 ? "+" : ""}${diff.change.toLocaleString()}B) ${change.path}`
        );
        changes.push(change);
      }
    })
  );

  if (changes.length === 0) return;

  const [owner, repo] = repoRaw.split("/");
  const latestCommitSha = (
    await octokit.git.getRef({
      owner,
      repo,
      ref: `heads/${branch}`,
    })
  ).data.object.sha;
  const treeSha = (
    await octokit.git.getCommit({
      owner,
      repo,
      commit_sha: latestCommitSha,
    })
  ).data.tree.sha;
  const blobs: GithubChangeBlob[] = [];
  const bar = new ProgressBar("Blobs :bar", changes.length);

  for (const change of changes) {
    const createdBlob = await createBlob(owner, repo, change);
    blobs.push(createdBlob!);
    bar.tick();
  }

  const { data: treeData } = await octokit.git.createTree({
    owner,
    repo,
    base_tree: treeSha,
    tree: blobs,
  });
  const { data: newCommitData } = await octokit.git.createCommit({
    owner,
    repo,
    message,
    tree: treeData.sha,
    parents: [latestCommitSha],
  });
  await octokit.git.updateRef({
    owner,
    repo,
    ref: `heads/${branch}`,
    sha: newCommitData.sha,
    force: true,
  });
}
