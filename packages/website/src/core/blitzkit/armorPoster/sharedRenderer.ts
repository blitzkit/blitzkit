import {
  createArmorPosterRenderer,
  type ArmorPosterRenderer,
} from "./armorPosterRenderer";

const CONCURRENCY = 6;

let renderer: ArmorPosterRenderer | undefined;
let launching: Promise<ArmorPosterRenderer> | undefined;

/**
 * One Puppeteer browser is shared across every `[slug].png.ts` route
 * generated in a build (see ../../../integrations/armorPosterRenderer.ts,
 * which pre-warms this in `astro:build:start` and disposes it in
 * `astro:build:done` - safe because `build.concurrency` is in-process
 * async concurrency, not worker threads, so this module-level singleton
 * is shared across all route renders). Falls back to lazily creating one
 * here too, so `astro dev` (which never fires build hooks) still works.
 */
export function getSharedArmorPosterRenderer(): Promise<ArmorPosterRenderer> {
  if (renderer) return Promise.resolve(renderer);

  launching ??= createArmorPosterRenderer(CONCURRENCY).then((created) => {
    renderer = created;
    return created;
  });

  return launching;
}

export async function closeSharedArmorPosterRenderer(): Promise<void> {
  const current = renderer ?? (await launching);

  renderer = undefined;
  launching = undefined;

  await current?.close();
}
