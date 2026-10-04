# BlitzKit

Your Blitz experience, elevated. https://blitzkit.app/.

## Developing

### Prerequisites

#### Bun

[Bun](https://bun.sh/) is the package manager and runtime that BlitzKit uses.

Ideally, you should also uninstall Node.js if you have it installed to avoid any cases where Node.js is used to run code instead of Bun which happens in some cases. But, this is not required and is unlikely to cause issues.

#### Linux (Optional)

All work on BlitzKit is done on Linux and macOS. It is theoretically possible to work on Windows; please feel free to try and share your discoveries with us!

### Setting Up

Start by cloning the repository and changing directories.

```bash
git clone https://github.com/blitzkit/blitzkit.git
cd blitzkit
```

> [!INFO]
> There is a closed source submodule under `packages/closed` that you can safely ignore. This sole purpose of this submodule is to provide `dvp.ts`, a proprietary Wargaming game asset tree compression tool. You will not need this at any point.
