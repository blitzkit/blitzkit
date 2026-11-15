# AGENTS.md

If you are an AI coding agent working in this repository, read **[AI_AGENTS.md](./AI_AGENTS.md)** before making any changes. The [Rules for Agents](./AI_AGENTS.md#rules-for-agents) section is addressed to you directly and is binding.

> **Scope:** these rules bind agents producing changes intended for submission to this repository as a pull request. That is the default assumption — if you are reading this file, it applies to you, unless the person operating you is a member of the BlitzKit GitHub organisation and has given you instructions that explicitly supersede it. See the note at the end of [AI_AGENTS.md](./AI_AGENTS.md).

The essentials, in case you read nothing else:

1. **Protected paths — do not modify:** `.github/workflows/`, `packages/closed/`, `.gitmodules`, `bun.lock`, `docs/legal/`, `packages/core/src/protos/*.ts`, `packages/i18n/strings/*.json` other than `en.json`, `.env` and `template.env` files, `packages/scripts/src/core/github/`, `packages/scripts/src/downloadClient/`.
2. **No dependency changes.** No new packages, no version bumps.
3. **No new game file format readers or binary layouts** without a human who has verified them against real client files.
4. **No secrets in the diff** — keys, tokens, Steam credentials, Wargaming application IDs, personal paths.
5. **Stay in scope.** No opportunistic refactors or reformatting of untouched files.
6. **Do not claim verification you did not perform.** Report failures with their output.
7. **Do not invent APIs or game data.** Check library APIs against their docs or types, and game values against the client files.
8. **Match the surrounding style**, including comment density.

## Project orientation

- **What it is:** a website of tools for World of Tanks Blitz players (Tankopedia, Compare, tier lists, and more), built from data read directly out of the game client. AGPL-3.0.
- **Stack:** Bun workspaces, TypeScript, Astro with React and Radix Themes, three.js through React Three Fiber, protobuf for game data.
- **Packages:** `packages/website` (the site and its API routes), `packages/core` (game file readers, protobuf definitions, shared logic), `packages/i18n` (strings), `packages/scripts` (CLI tooling), `packages/closed` (closed-source submodule; not needed and not to be touched).
- **Setup:** see the [README](./README.md). You need a local World of Tanks Blitz install, with `CLIENT_DIR` in `packages/website/.env` pointing at it.
- **Run:** `bun dev` from the repository root. After editing a `.proto` file, run `bun run build-protos`.
- **Checks:** there is no test suite. Run `bun run lint` (`astro check`) in `packages/website`, then exercise the change in a browser.
- **Translations:** add strings to `packages/i18n/strings/en.json` only; other locales are synced from Crowdin.
- **Technical notes:** `docs/technical/`.
