/**
 * The RSS feed at `/rss.xml`.
 *
 * @packageDocumentation
 * @file rss.xml.ts
 * @author Jimmy Kurian
 * @copyright Copyright (c) 2026 Jimmy Kurian. All rights reserved. See LICENSE.
 */
import rss from '@astrojs/rss';
import type { APIContext } from 'astro';
import site from '../data/site.json';
import { getPosts } from '../lib/posts';

/**
 * Builds the feed: every published post, newest first, linking back to `/writing/<id>/`.
 *
 * @param context - Astro's endpoint context; `site` gives the feed's absolute URLs.
 * @returns The RSS document.
 */
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
