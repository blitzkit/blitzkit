import locales from "@blitzkit/i18n/locales.json";
import type { APIContext, GetStaticPaths } from "astro";
import { api } from "../../../core/api/dynamic";

export const getStaticPaths = (() => {
  return locales.supported.map(({ locale }) => ({ params: { locale } }));
}) satisfies GetStaticPaths;

/**
 * BlitzKit strings.
 */
export async function GET({ params }: APIContext<never, { locale: string }>) {
  const strings = await api.strings(params.locale);
  return Response.json(strings);
}
