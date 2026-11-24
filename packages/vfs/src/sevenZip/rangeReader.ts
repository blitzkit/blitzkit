interface Volume {
  url: string;
  start: number;
  size: number;
}

// Treats several URLs as one contiguous file
export class HTTPMultiRangeReader {
  size = 0;
  private volumes: Volume[] = [];

  constructor(private urls: string[]) {}

  async init() {
    const sizes = await Promise.all(
      this.urls.map(async (url) => {
        const response = await fetch(url, { method: "HEAD" });

        if (!response.ok) {
          throw new Error(`HEAD ${url} failed: ${response.status}`);
        }

        const size = Number(response.headers.get("content-length"));

        if (!Number.isFinite(size)) {
          throw new Error(`No content-length for ${url}`);
        }

        return size;
      }),
    );

    let start = 0;

    this.volumes = this.urls.map((url, i) => {
      const volume = { url, start, size: sizes[i] };
      start += sizes[i];
      return volume;
    });

    this.size = start;

    return this;
  }

  async read(offset: number, length: number) {
    const end = offset + length;

    if (offset < 0 || end > this.size) {
      throw new Error(`Read out of bounds: ${offset}+${length}`);
    }

    if (length === 0) return new Uint8Array(0);

    const parts: Promise<Uint8Array<ArrayBuffer>>[] = [];

    for (const volume of this.volumes) {
      const start = Math.max(offset, volume.start);
      const stop = Math.min(end, volume.start + volume.size);

      if (start >= stop) continue;

      parts.push(
        this.fetch(volume.url, start - volume.start, stop - volume.start),
      );
    }

    const chunks = await Promise.all(parts);

    if (chunks.length === 1) return chunks[0];

    const result = new Uint8Array(length);
    let cursor = 0;

    for (const chunk of chunks) {
      result.set(chunk, cursor);
      cursor += chunk.length;
    }

    return result;
  }

  private async fetch(url: string, start: number, stop: number) {
    const response = await fetch(url, {
      headers: { Range: `bytes=${start}-${stop - 1}` },
    });

    if (response.status !== 206) {
      throw new Error(
        `Expected 206 for ${url} [${start}, ${stop}), got ${response.status}`,
      );
    }

    const data = new Uint8Array(await response.arrayBuffer());

    if (data.length !== stop - start) {
      throw new Error(
        `Short read from ${url}: ${data.length} of ${stop - start} bytes`,
      );
    }

    return data;
  }
}
