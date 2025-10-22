import sharp from "sharp";

const cache: Record<string, Buffer> = {};

export async function iconPng(url: string) {
  if (!url.endsWith(".webp")) return url;

  if (!cache[url]) {
    const imageResponse = await fetch(url);
    const imageBufferWEBP = await imageResponse.arrayBuffer();
    const imageBufferPNG = await sharp(imageBufferWEBP).png().toBuffer();
    cache[url] = imageBufferPNG;
  }

  return `data:image/png;base64,${cache[url].toString("base64")}`;
}
