// downloads wait on latency, not bandwidth, so far more run at once than
// astro's build concurrency would allow
const PARALLEL_DOWNLOADS = 16;

// starts every download, a few at a time in order, and returns each one's promise
export function parallelDownloads<Item, Result>(
  items: Item[],
  download: (item: Item) => Promise<Result>,
) {
  const lanes = Array<Promise<unknown>>(PARALLEL_DOWNLOADS).fill(
    Promise.resolve(),
  );

  return items.map((item, index) => {
    const lane = index % PARALLEL_DOWNLOADS;
    const result = lanes[lane].then(() => download(item));

    lanes[lane] = result.catch(() => {});

    return result;
  });
}
