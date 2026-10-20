import rss from '@astrojs/rss';
import type { APIContext } from 'astro';
import site from '../data/site.json';
import { getPosts } from '../lib/posts';

export async function GET(context: APIContext) {
  const posts = await getPosts();
  return rss({
    title: `${site.name}, writing`,
    description: 'Engineering practice, AI-assisted development, and leading forward-deployed teams.',
    site: context.site!,
    trailingSlash: true,
    items: posts.map((post) => ({
      title: post.data.title,
      description: post.data.description,
      pubDate: post.data.pubDate,
      categories: post.data.tags,
      link: `/writing/${post.id}/`,
    })),
    customData: '<language>en-us</language>',
  });
}
