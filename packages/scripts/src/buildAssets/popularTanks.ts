import {
  assertSecret,
  fetchTankDefinitions,
  PopularTanks,
} from "@blitzkit/core";
import { google } from "googleapis";
import { AssetUploader } from "../core/github/assetUploader";

export async function popularTanks() {
  using uploader = new AssetUploader("popular tanks");
  const tankDefinitions = await fetchTankDefinitions();

  const auth = await google.auth.getClient({
    keyFile: import.meta.env.GOOGLE_APPLICATION_CREDENTIALS,
    scopes: ["https://www.googleapis.com/auth/analytics.readonly"],
  });
  const analytics = google.analyticsdata({ version: "v1beta", auth });
  const report = await analytics.properties.runReport({
    property: `properties/${assertSecret(
      import.meta.env.PUBLIC_GOOGLE_ANALYTICS_PROPERTY_ID
    )}`,
    requestBody: {
      dateRanges: [{ startDate: "7daysAgo", endDate: "today" }],
      dimensions: [{ name: "pagePath" }],
      metrics: [{ name: "screenPageViews" }],
      orderBys: [{ metric: { metricName: "screenPageViews" }, desc: true }],
      dimensionFilter: {
        filter: {
          fieldName: "pagePath",
          stringFilter: {
            matchType: "BEGINS_WITH",
            value: "/tanks/",
          },
        },
      },
    },
  });

  if (!report.data.rows) {
    throw new Error("No rows in report");
  }

  const tanks = report.data.rows
    .filter(
      (row) =>
        row.dimensionValues &&
        row.dimensionValues[0].value &&
        row.dimensionValues[0].value !== "/tanks/" &&
        row.metricValues &&
        row.metricValues[0].value
    )
    .map((row) => ({
      id: Number(
        row.dimensionValues![0].value!.match(
          /\/tools\/tankopedia\/(\d+)\/?/
        )?.[1]
      ),
      views: Number(row.metricValues![0].value!),
    }))
    .filter((row) => {
      if (!(row.id in tankDefinitions.tanks)) {
        console.warn("Skipping unknown popular tank", row.id);
        return false;
      }

      return row.id in tankDefinitions.tanks;
    })
    .slice(0, 8)
    .map(({ id, views }) => ({ id, views }));
  const popularTanks: PopularTanks = { tanks };

  await uploader.add({
    path: "definitions/popular-tanks.pb",
    content: PopularTanks.encode(popularTanks).finish(),
  });
  await uploader.flush();
}
