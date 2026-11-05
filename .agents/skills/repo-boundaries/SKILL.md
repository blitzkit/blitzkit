---
name: repo-boundaries
description: Apply the user's persistent repository boundaries whenever working in their projects.
---

# Repo Boundaries

Apply these boundaries to all work in the user's repositories:

- Read-only Git commands are allowed when useful, including status, diff, log, and show. Do not run Git commands that modify repository state.
- Never edit `bun.lock`, including regenerating or formatting it. When dependency manifests change, leave the lockfile alone; the user will update it by running `bun install`.

These are firm constraints, not preferences to revisit for a task. Continue useful work within them and explain any limitation if a requested result would require crossing either boundary.
