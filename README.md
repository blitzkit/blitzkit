# BlitzKit

Apps for World of Tanks Blitz.

## Development

Setting up a local developer environment for BlitzKit is more complex than most projects, but this section will guide you through all the steps. If you're ever lost or confused, feel free to ask for help in [the official Discord server](https://discord.gg/nDt7AjGJQH).

### Prerequisites

Before you touch any code, you'll need the following.

#### 1. Linux

Because Node API for .NET doesn't resolve runtime-specific object files for libraries, the entirety of the BlitzKit project is "vendor-locked" to a single OS. GitHub Actions, responsible for BlitzKit CD/CI works best with Ubuntu, thus we must also use a Linux OS.

#### 2. Bun

https://bun.com/

BlitzKit is written mostly in TypeScript, with packages fetched from NPM, managed by Bun.
