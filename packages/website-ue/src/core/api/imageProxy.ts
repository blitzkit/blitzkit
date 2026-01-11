import sharp from "sharp";

export async function imageProxy(url: string) {
  if (import.meta.env.DEV) {
    return Response.redirect(url);
  }

  let response: Response;

  try {
    response = await fetch(url);
  } catch (error) {
    console.warn(`Failed to fetch image proxy ${url}:`, error);
    return new Response(null, { status: 404 });
  }

  const buffer = await response.arrayBuffer();
  const image = sharp(buffer);
  const webp = await image.webp().toBuffer();
  const array = new Uint8Array(webp);

  return new Response(array);
}
