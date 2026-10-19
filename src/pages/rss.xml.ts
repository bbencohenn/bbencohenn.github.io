import rss from '@astrojs/rss';
import type { APIContext } from 'astro';
import { getPosts, getSettings } from '../lib/site';

export async function GET(context: APIContext) {
  const s = await getSettings();
  const posts = await getPosts();
  return rss({
    title: `${s.name}: writing`,
    description: s.description,
    site: context.site!,
    items: posts.map((p) => ({
      title: p.data.title,
      pubDate: p.data.date,
      description: p.data.summary,
      categories: [p.data.category, ...p.data.tags],
      link: `/writing/${p.id}/`,
    })),
    customData: '<language>en-au</language>',
  });
}
