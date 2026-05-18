import locales from "@blitzkit/i18n/locales.json";
import type { GetStaticPathsResult } from "astro";
import { api } from "../../../../api/dynamic";
import { mixStaticPaths } from "../../../../astro/mixStaticPaths";
import { getStaticPaths as _getStaticPaths } from "../../_index";

export const getStaticPaths = mixStaticPaths(_getStaticPaths, async () => {
  const paths: GetStaticPathsResult = [];
  const groups = await api.gameStringGroups();

  for (const { locale } of locales.supported) {
    for (const group of groups) {
      paths.push({ params: { locale, group } });
    }
  }

  return paths;
});

export async function GET({
  params,
}: {
  params: { locale: string; group: string };
}) {
  const strings = await api._groupedGameStrings(
    params.locale,
    params.group,
    false,
  );
  return Response.json(strings);
}
