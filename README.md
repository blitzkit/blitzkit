# BlitzKit

Your Blitz experience, elevated. https://blitzkit.app/.

## Developing: Prerequisites

There's a few things you'll need to get started. If this is your first time working with BlitzKit, it's completely safe to ignore all optional prerequisites below to get things running as quickly as possible.

### Bun

[Bun](https://bun.sh/) is the package manager and runtime that BlitzKit uses.

Ideally, you should also uninstall Node.js if you have it installed to avoid any cases where Node.js is used to run code instead of Bun which happens in some cases. But, this is not required and is unlikely to cause issues.

### Protocol Buffer

BlitzKit uses [Protocol Buffer's protoc CLI](https://protobuf.dev/installation/) to generate efficiently packed data structures to serve data to clients in place of JSON.

### World of Tanks Blitz

You will need a local installation of [World of Tanks Blitz](https://wotblitz.com/) for BlitzKit to build off.

### aria2 (Optional)

If you plan to use BlitzKit's client-management CLI for BlitzKit Previews, you will need to [get aria2](https://aria2.github.io/) to speed up your downloads.

### libarchive (Optional)

If you plan to use BlitzKit's client-management CLI for BlitzKit OpenTests, you will need to [get libarchive](https://www.libarchive.org/) to keep your downloads completely in-memory.

### Linux (Optional)

All work on BlitzKit is done on Linux and macOS. It is theoretically possible to work on Windows; please feel free to try and share your discoveries with us!

## Developing: Setting Up

Start by cloning the repository and changing directories.

```bash
git clone https://github.com/blitzkit/blitzkit.git
cd blitzkit
```

> [!NOTE]
> There is a closed source submodule under `packages/closed` that you can safely ignore. This sole purpose of this submodule is to provide `dvp.ts`, a proprietary Wargaming game asset tree compression tool. You will not need this at any point.

Then, download the dependencies with Bun.

```bash
bun install
```

Finally, compile the proto files into TypeScript.

```bash
build build-protos
```

## Developing: Running

```bash
bun dev
```
