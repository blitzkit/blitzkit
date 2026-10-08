import { alias } from "@blitzkit/core";

const EXTERNAL_IMAGE = /^https?:\/\//;
const MARKDOWN_IMAGES = [
  /!\[[^\]]*\]\((\S+?)(?:\s+"[^"]*")?\)/g,
  /<img[^>]*\ssrc=["']([^"']+)["']/g,
];

export function isExternalImage(src: string) {
  return EXTERNAL_IMAGE.test(src);
}

export function docImageId(url: string) {
  let hash = 0x811c9dc5;

  for (let index = 0; index < url.length; index++) {
    hash ^= url.charCodeAt(index);
    hash = Math.imul(hash, 0x01000193) >>> 0;
  }

  return hash.toString(16).padStart(8, "0");
}

export function docImageUrl(url: string) {
  return alias("api", `/docs/images/${docImageId(url)}.webp`);
}

export function externalDocImages(markdown: string) {
  return MARKDOWN_IMAGES.flatMap((pattern) =>
    Array.from(markdown.matchAll(pattern), (match) => match[1]),
  ).filter(isExternalImage);
}
