import { throttle } from "lodash-es";
import type { FileChange } from "./commitMultipleFiles";
import { octokit } from "./octokit";

export interface GithubChangeBlob {
  sha: string;
  path: string;
  mode: "100644";
  type: "blob";
}

const TIME_PER_BLOB = 2 ** 4 * 1000;

// github rate limit: 5000 requests per hour
export const createBlob = throttle(
  async (owner: string, repo: string, change: FileChange) => {
    while (true) {
      try {
        const { sha } = (
          await octokit.git.createBlob({
            owner,
            repo,
            content: Buffer.from(change.content).toString("base64"),
            encoding: "base64",
          })
        ).data;

        return {
          sha,
          path: change.path,
          mode: "100644",
          type: "blob",
        } satisfies GithubChangeBlob;
      } catch (error) {
        console.warn(
          `Failed blob ${change.path}; retrying in ${TIME_PER_BLOB}ms...`,
          error
        );

        await new Promise((resolve) => setTimeout(resolve, TIME_PER_BLOB));
      }
    }
  },
  (5000 / (60 * 60 * 1000)) * 0.9,
  { trailing: true }
);
