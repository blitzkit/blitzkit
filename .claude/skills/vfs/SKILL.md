---
name: vfs
description: Read files from the World of Tanks Blitz game client (including DVPL-compressed ones) via scripts/vfs.sh. Use when you need to list, read, or parse game data like Data/*.yaml, version.txt, or any asset in the client install, or when you need to know where the client install and wotblitz.exe are.
---

# Game client VFS

`scripts/vfs.sh` reads files out of the installed game client and transparently handles DVPL decompression. Use it instead of reading the Steam directory directly, because many client files are DVPL-compressed and raw reads give you garbage.

Run it from the repo root (the wrapper `cd`s into `packages/scripts` itself):

```bash
scripts/vfs.sh ls   <dir>    # list a directory, one entry per line
scripts/vfs.sh cat  <file>   # raw file contents to stdout (decompressed)
scripts/vfs.sh yaml <file>   # parse a YAML file, print as JSON
```

The path argument is required. Paths are relative to the client root, e.g. `Data/version.txt`. Without a path it exits 1.

Source of truth for commands: `packages/scripts/src/vfs/index.ts`. Check it if a command here seems missing.

## Examples (verified)

```bash
scripts/vfs.sh cat Data/version.txt        # 11.21.0.1235_7376187 release/11.21.0 WOTB_Win7 (no trailing newline)
scripts/vfs.sh ls Data                     # *.yaml configs, 3d, Configs, Fonts, ...
scripts/vfs.sh yaml Data/countries.yaml    # JSON: { "ru": ["AM", "AZ", ...], ... }
```

## Where the client is

- The install dir comes from `CLIENT_DIR` in `packages/website/.env` (read via `packages/scripts/src/vfs/vfs.ts`). The location is machine-specific, so read that `.env` to find it rather than assuming a path. The `.env` may also contain commented-out alternative client locations.
- Executable: `wotblitz.exe` in that directory (~74 MB). `wotblitz-browser.exe` is the small embedded-browser helper, not the game.
- The `.env` holds an application ID and paths; don't paste its secrets elsewhere.

## Reverse engineering the executable

For binary analysis of `wotblitz.exe`, use the REA MCP tools (`mcp__rea__*`, load via ToolSearch). Nothing is open by default: call `open_binary` with the exe path first, and `close_binary` when done. The `rea` CLI is not on PATH, so `rea doctor` is unavailable; the MCP server is the interface.

## Notes

- Read-only: the VFS never modifies the client.
- Prefer `yaml` over `cat` for `.yaml` files when you want to query structure.
- Large outputs: pipe through `head` or `jq`.
