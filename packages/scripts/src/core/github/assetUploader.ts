import { assertSecret } from "@blitzkit/core";
import { Octokit } from "@octokit/rest";
import ProgressBar from "progress";
import { compareUint8Arrays } from "./compareUint8Arrays";

export interface FileChange {
  path: string;
  content: Uint8Array;
}

interface GithubChangeBlob {
  sha: string;
  path: string;
  mode: "100644";
  type: "blob";
}

enum DiffStatus {
  New,
  Changed,
  Unchanged,
}

export class AssetUploader {
  time_per_blob = 2 ** 4 * 1000;
  time_between_blobs = (60 * 60 * 1000) / 5000 / 0.9;

  max_tree_size = 7_000_000;
  max_file_count = 128;

  heuristicFormats = ["glb", "webp", "jpg", "png"];

  owner: string;
  repo: string;
  branch: string;

  changes: FileChange[] = [];
  changesSize = 0;

  private octokit = new Octokit({
    auth: assertSecret(import.meta.env.GH_TOKEN),
  });

  constructor(public message: string) {
    [this.owner, this.repo] = assertSecret(
      import.meta.env.PUBLIC_ASSET_REPO
    ).split("/");
    this.branch = assertSecret(import.meta.env.PUBLIC_ASSET_BRANCH);
  }

  async add(change: FileChange) {
    const blobPath = `${this.owner}/${this.repo}/${this.branch}/${change.path}`;
    const response = await fetch(
      `https://raw.githubusercontent.com/${blobPath}`,
      { headers: { "Accept-Encoding": "identity" } }
    );
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
        this.heuristicFormats.some((format) =>
          change.path.endsWith(`.${format}`)
        )
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
      console.log(`🔵 ${change.path}`);
    } else {
      console.log(
        `${diff.status === DiffStatus.New ? "🟢" : "🟡"} (${
          diff.change > 0 ? "+" : ""
        }${diff.change.toLocaleString()}B) ${change.path}`
      );

      // flush BEFORE going over limit
      if (
        this.changesSize + change.content.length > this.max_tree_size ||
        this.changes.length + 1 > this.max_file_count
      ) {
        console.log(`Flushing ${this.changes.length} changes...`);
        await this.flush();
      }

      this.changes.push(change);
      this.changesSize += change.content.length;
    }
  }

  async flush() {
    if (this.changes.length == 0) return;

    const latestCommitSha = (
      await this.octokit.git.getRef({
        owner: this.owner,
        repo: this.repo,
        ref: `heads/${this.branch}`,
      })
    ).data.object.sha;
    const treeSha = (
      await this.octokit.git.getCommit({
        owner: this.owner,
        repo: this.repo,
        commit_sha: latestCommitSha,
      })
    ).data.tree.sha;
    const blobs: GithubChangeBlob[] = [];
    const bar = new ProgressBar("Blobs :bar", this.changes.length);

    for (const change of this.changes) {
      while (true) {
        try {
          const start = Date.now();
          var { sha } = await this.octokit.git
            .createBlob({
              owner: this.owner,
              repo: this.repo,
              encoding: "base64",
              content: Buffer.from(change.content).toString("base64"),
            })
            .then((response) => response.data);
          const end = Date.now();

          console.log(`  blobbed ${change.path} ${end - start}ms`);

          await new Promise((resolve) =>
            setTimeout(
              resolve,
              Math.max(0, this.time_between_blobs + (start - end))
            )
          );

          blobs.push({ sha, path: change.path, mode: "100644", type: "blob" });
          bar.tick();

          break;
        } catch {
          console.warn(
            `  failed ${change.path}; retrying in ${this.time_per_blob}ms...`
          );

          await new Promise((resolve) =>
            setTimeout(resolve, this.time_per_blob)
          );
        }
      }
    }

    const { data: treeData } = await this.octokit.git.createTree({
      owner: this.owner,
      repo: this.repo,
      base_tree: treeSha,
      tree: blobs,
    });
    const { data: commitData } = await this.octokit.git.createCommit({
      owner: this.owner,
      repo: this.repo,
      message: this.message,
      tree: treeData.sha,
      parents: [latestCommitSha],
    });

    await this.octokit.git.updateRef({
      owner: this.owner,
      repo: this.repo,
      ref: `heads/${this.branch}`,
      sha: commitData.sha,
      force: true,
    });

    this.changes = [];
    this.changesSize = 0;
  }

  [Symbol.dispose]() {
    if (this.changes.length > 0) {
      throw new Error(
        `${this.changes.length} uncommitted changes. Did you forget to flush?`
      );
    }
  }
}
