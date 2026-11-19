import { assertSecret } from "@blitzkit/core";
import { load } from "cheerio";
import type { TankGuide } from "../../types/tankGuide";
import { parallelDownloads } from "./parallelDownloads";

// every locale renders the same guide, so each slug is only fetched once
const guides = new Map<string, Promise<TankGuide | undefined>>();

async function fetchTankGuide(slug: string) {
  const url = `${assertSecret(import.meta.env.PUBLIC_GUIDE_WEBSITE)}/${slug}`;
  const response = await fetch(url);

  if (!response.ok) return undefined;

  const $ = await response.text().then(load);
  const description = $(".entry-content p").first().text();
  const image = $(".entry-content img").first().attr("src")?.toString();

  if (description === undefined && image === undefined) return undefined;

  return { url, description, image } satisfies TankGuide;
}

export function prefetchTankGuides(slugs: string[]) {
  parallelDownloads(slugs, tankGuide);
}

export function tankGuide(slug: string) {
  let guide = guides.get(slug);

  if (guide === undefined) {
    guide = fetchTankGuide(slug);
    guides.set(slug, guide);
  }

  return guide;
}
