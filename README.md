# BlitzKit

Encyclopedia for World of Tanks Blitz.

## Development

Setting up a local developer environment for BlitzKit is more complex than most projects, but this section will guide you through all the steps. If you're ever lost or confused, feel free to ask for help in [the official Discord server](https://discord.gg/nDt7AjGJQH).

### Prerequisites

Before you touch any code, you'll need the following.

#### 1. Linux

Because Node API for .NET doesn't resolve runtime-specific object files for libraries, the entirety of the BlitzKit project is "vendor-locked" to a single OS. GitHub Actions, responsible for BlitzKit CD/CI works best with Ubuntu, thus we must also use a Linux OS.

#### 2. Bun

https://bun.com/

BlitzKit is written mostly in TypeScript, with packages fetched from NPM, managed by Bun.

#### 3. .NET

https://dotnet.microsoft.com/download/dotnet/9.0/

You'll need the .NET 9.0 SDK to build and run the interface layer between BlitzKit and your local installation of World of Tanks Blitz.

#### 4. Protocol Buffers

https://protobuf.dev/installation/

Both BlitzKit and World of Tanks Blitz encode their APIs with Protocol Buffers.

#### 5. World of Tanks Blitz

https://store.steampowered.com/app/444200/

You'll need an up-to-date installation of World of Tanks Blitz on your computer. You may use the same installation that you play, even on a Windows partition if you dual boot.

#### 6. UE4SS

...

#### 7. FModel

...

### Set Up

#### 1. Cloning

BlitzKit is a massive monorepo with a lot of submodules. You'll likely not need all the branches and commit history. So, clone with depth 1.

```bash
git clone --depth 1 https://github.com/blitzkit/blitzkit.git
cd blitzkit
git submodule update --init --recursive --depth 1
```

#### 2. Proto Files

...

#### 3. Mappings

...

#### 4. Environment Variables

...

#### 5. The Big One

...

### Development Server

...

### Building

...

### Branches & Pull Requests

...
