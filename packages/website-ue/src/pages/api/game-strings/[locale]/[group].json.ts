import locales from "@blitzkit/i18n/locales.json";
import type { GetStaticPaths, GetStaticPathsResult } from "astro";
import { api } from "../../../../core/api/dynamic";

export const getStaticPaths = (async () => {
  const paths: GetStaticPathsResult = [];
  const groups = await api.gameStringGroups();

  for (const { locale } of locales.supported) {
    for (const group of groups) {
      paths.push({ params: { locale, group } });
    }
  }

  return paths;
}) satisfies GetStaticPaths;

export async function GET({
  params,
}: {
  params: { locale: string; group: string };
}) {
  const strings = await api.groupedGameStrings(
    params.locale,
    params.group,
    false
  );
  return Response.json(strings);
}
