import puppeteer, { type Browser, type Page } from "puppeteer";
import { bundleHarness } from "./bundleHarness";
import type { PosterPayload } from "./buildTankPosterPayload";

export interface ArmorPosterRenderer {
  render(payload: PosterPayload): Promise<Buffer>;
  close(): Promise<void>;
}

async function createHarnessPage(browser: Browser, bundle: string): Promise<Page> {
  const page = await browser.newPage();
  await page.setContent("<!doctype html><html><body></body></html>");
  await page.addScriptTag({ content: bundle });
  return page;
}

async function renderOnPage(page: Page, payload: PosterPayload): Promise<Buffer> {
  const dataUrl = await page.evaluate((data) => {
    return (
      window as unknown as {
        renderArmorPoster: (poster: typeof data) => string;
      }
    ).renderArmorPoster(data);
  }, payload);

  const base64 = dataUrl.slice(dataUrl.indexOf(",") + 1);
  return Buffer.from(base64, "base64");
}

/**
 * One browser is launched and reused for every tank (WebGL context + page
 * navigation setup cost far outweighs a single render), rather than
 * spinning up a new browser per tank across ~1000+ tanks.
 * `--use-gl=angle --use-angle=swiftshader` gives a real, software-rendered
 * WebGL2 context with no GPU, which is what CI runners need too.
 *
 * `concurrency` pages are opened up front and pooled, so callers can fire
 * many `render()` calls at once (e.g. via a worker-pool over all tanks)
 * and get real parallelism instead of queuing behind a single page.
 */
export async function createArmorPosterRenderer(
  concurrency = 4,
): Promise<ArmorPosterRenderer> {
  const bundle = await bundleHarness();
  const browser: Browser = await puppeteer.launch({
    headless: true,
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--use-gl=angle",
      "--use-angle=swiftshader",
      "--enable-unsafe-swiftshader",
      "--disable-gpu-sandbox",
    ],
  });

  const pages = await Promise.all(
    Array.from({ length: concurrency }, () => createHarnessPage(browser, bundle)),
  );

  const freePages = [...pages];
  const waiters: ((page: Page) => void)[] = [];

  function acquire(): Promise<Page> {
    const page = freePages.pop();
    if (page) return Promise.resolve(page);
    return new Promise((resolve) => waiters.push(resolve));
  }

  function release(page: Page) {
    const waiter = waiters.shift();
    if (waiter) waiter(page);
    else freePages.push(page);
  }

  return {
    async render(payload) {
      const page = await acquire();

      try {
        return await renderOnPage(page, payload);
      } finally {
        release(page);
      }
    },

    async close() {
      await browser.close();
    },
  };
}
