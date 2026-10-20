/**
 * The blog posts: which ones are published, how long they take to read, and how their dates show.
 *
 * @packageDocumentation
 * @file posts.ts
 * @author Jimmy Kurian
 * @copyright Copyright (c) 2026 Jimmy Kurian. All rights reserved. See LICENSE.
 */
import { getCollection, type CollectionEntry } from 'astro:content';

/** A blog post, an MDX file in `src/content/posts/`. */
export type Post = CollectionEntry<'posts'>;

/** Published posts, newest first. Drafts show in `astro dev` and never in a production build. */
export async function getPosts(): Promise<Post[]> {
  const posts = await getCollection('posts', ({ data }) => import.meta.env.DEV || !data.draft);
  return posts.sort((a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf());
}

/**
 * Estimated minutes to read a post, at 230 words a minute, never less than one.
 *
 * @param body - The post's Markdown. Fenced code blocks and MDX comments don't count.
 * @returns Whole minutes, at least 1.
 */
export function readingMinutes(body = ''): number {
  const words = body
    .replace(/```[\s\S]*?```/g, '')
    .replace(/\{\/\*[\s\S]*?\*\/\}/g, '')
    .split(/\s+/)
    .filter(Boolean).length;
  return Math.max(1, Math.round(words / 230));
}

/**
 * A post date written out in full.
 *
 * @remarks
 * Dates are calendar days in frontmatter, so they're formatted in UTC to avoid an off-by-one.
 *
 * @param d - The date to format.
 * @returns The date as "October 20, 2026".
 */
export const formatDate = (d: Date) =>
  d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric', timeZone: 'UTC' });
