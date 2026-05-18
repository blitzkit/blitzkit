import locales from "@blitzkit/i18n/locales.json";
import type { APIContext } from "astro";
import { api } from "../../../api/dynamic";
import { mixStaticPaths } from "../../../astro/mixStaticPaths";
import { getStaticPaths as _getStaticPaths } from "../_index";

export const getStaticPaths = mixStaticPaths(_getStaticPaths, () => {
  return locales.supported.map(({ locale }) => ({ params: { locale } }));
});

/**
 * BlitzKit strings.
 */
export async function GET({ params }: APIContext<never, { locale: string }>) {
  const strings = await api.strings(params.locale);
  return Response.json(strings);
}
