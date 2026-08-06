import { execFile } from "node:child_process";
import { readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);

let bundlePromise: Promise<string> | undefined;

/**
 * Bundles harnessEntry.ts (three.js + our render function) into a single
 * classic-script IIFE so it can be injected into a Puppeteer page via
 * `page.addScriptTag({ content })` - no ES module resolution needed inside
 * the page, which sidesteps `file://`/CORS module-loading issues entirely.
 * Bundled once and cached for the life of the process.
 *
 * Two things this module deliberately avoids, both discovered by actually
 * running this through `astro build` (a direct `bun run someScript.ts`
 * invocation hits neither):
 * 1. Shells out to the `bun` CLI rather than calling the `Bun.build()`
 *    global directly - this module gets loaded through Astro/Vite's SSR
 *    pipeline (imported by the opengraph route), which runs in a context
 *    where the `Bun` global isn't defined even though the overall process
 *    was launched with `bun run build`.
 * 2. Resolves the entrypoint from `process.cwd()` rather than
 *    `import.meta.url` - Vite rewrites `import.meta.url` for
 *    SSR-bundled modules to a virtual path (e.g.
 *    `.astro/pages/opengraph/tanks/harnessEntry.ts`) that doesn't exist on
 *    disk. `process.cwd()` is a real OS-level property Vite can't
 *    virtualize, and every invocation path in this repo (`bun run dev`,
 *    `bun run build`, `cd packages/website && bun run build`) runs with
 *    cwd already set to this package's root.
 */
export function bundleHarness(): Promise<string> {
  bundlePromise ??= build();
  return bundlePromise;
}

async function build(): Promise<string> {
  const entrypoint = join(
    process.cwd(),
    "src/core/blitzkit/armorPoster/harnessEntry.ts",
  );
  const outfile = join(tmpdir(), `blitzkit-armor-harness-${process.pid}.js`);

  try {
    await execFileAsync("bun", [
      "build",
      entrypoint,
      "--target=browser",
      "--format=iife",
      `--outfile=${outfile}`,
    ]);

    return await readFile(outfile, "utf8");
  } finally {
    await rm(outfile, { force: true });
  }
}
