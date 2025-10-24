import { assertSecret } from "@blitzkit/core";
import { throttling } from "@octokit/plugin-throttling";
import { Octokit } from "@octokit/rest";

Octokit.plugin(throttling);

export const octokit = new Octokit({
  auth: assertSecret(import.meta.env.GH_TOKEN),
});
