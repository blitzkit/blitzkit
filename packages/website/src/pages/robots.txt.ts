import type { APIContext } from 'astro';

const ALLOW_ROBOTS = import.meta.env.ALLOW_ROBOTS === 'true';

export async function GET({ request }: APIContext) {
  const flags: Record<string, string | null> = {
    'User-agent': '*',
    Allow: ALLOW_ROBOTS ? '/' : null,
    Disallow: ALLOW_ROBOTS ? null : '/',

    space: null,
    Sitemap: `${new URL(request.url).origin}/sitemap-index.xml`,
  };

  return new Response(
    Object.entries(flags)
      .map(([key, value]) => (value === null ? '' : `${key}: ${value}`))
      .join('\n'),
  );
}
