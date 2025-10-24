import {
  asset,
  fetchTankDefinitions,
  Reviews,
  Video,
  youtubers,
} from "@blitzkit/core";
import { google } from "googleapis";
import { cloneDeep, uniqBy } from "lodash-es";
import { AssetUploader } from "./core/github/assetUploader";

const MAX_QUERIES = 64;

console.log("Finding reviews...");

const currentReviews = await fetch(asset("definitions/reviews.pb"))
  .then((response) => response.arrayBuffer())
  .then((buffer) => Reviews.decode(new Uint8Array(buffer)));
const auth = await google.auth.getClient({
  scopes: ["https://www.googleapis.com/auth/youtube.readonly"],
});
const youtube = google.youtube({ version: "v3", auth });

const tankDefinitions = await fetchTankDefinitions();
const tanks = Object.values(tankDefinitions.tanks);

const tanksSanitized = tanks
  .sort((a, b) => b.tier - a.tier)
  .sort((a, b) => {
    const lastUpdatedA = currentReviews.reviews[a.id]?.last_updated ?? 0;
    const lastUpdatedB = currentReviews.reviews[b.id]?.last_updated ?? 0;
    return lastUpdatedA - lastUpdatedB;
  });
const reviews: Reviews = cloneDeep(currentReviews);

let done = 0;

for (const tank of tanksSanitized) {
  if (done >= MAX_QUERIES) {
    console.log(`Limit reached with ${done} queries; stopping...`);
    break;
  }

  try {
    const results = await youtube.search.list({
      part: ["snippet"],
      q: `World of Tanks Blitz ${tank.name}`,
    });

    if (!results.data.items || results.data.items.length === 0) continue;

    const items = uniqBy(
      results.data.items.filter(
        (item) =>
          item.snippet?.channelId &&
          item.id?.videoId &&
          youtubers.some(({ id }) => id === item.snippet?.channelId)
      ),
      (item) => item.snippet!.channelId
    );

    reviews.reviews[tank.id] = {
      last_updated: Date.now(),
      videos: items.map(
        (item) =>
          ({
            id: item.id!.videoId!,
            author: item.snippet!.channelId!,
          } satisfies Video)
      ),
    };

    console.log(`${++done} done; found ${items.length} for ${tank.name}`);

    await new Promise((resolve) => setTimeout(resolve, 1000 / 5));
  } catch (error) {
    console.warn(`Limit reached with ${done} queries`);
    break;
  }
}

using uploader = new AssetUploader("reviews");

await uploader.add({
  content: Reviews.encode(reviews).finish(),
  path: "definitions/reviews.pb",
});
await uploader.flush();
