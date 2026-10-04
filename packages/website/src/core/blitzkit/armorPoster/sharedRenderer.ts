import {
  createArmorPosterRenderer,
  type ArmorPosterRenderer,
} from "./armorPosterRenderer";

let renderer: ArmorPosterRenderer | undefined;
let launching: Promise<ArmorPosterRenderer> | undefined;

/**
 * One WebGPU renderer (see ./armorPosterRenderer.ts) is shared across every
 * `[slug].png.ts` route generated in a build, and disposed in
 * `astro:build:done` (see ../../../integrations/armorPosterRenderer.ts).
 * Sharing is safe because `build.concurrency` is in-process async
 * concurrency, not worker threads, so this module-level singleton is shared
 * across all route renders. It's created lazily on the first render, which
 * also makes `astro dev` (which never fires build hooks) work.
 */
export function getSharedArmorPosterRenderer(): Promise<ArmorPosterRenderer> {
  if (renderer) return Promise.resolve(renderer);

  launching ??= createArmorPosterRenderer().then((created) => {
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
