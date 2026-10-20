/**
 * Publications, patents and talks, and the labels they show with.
 *
 * @packageDocumentation
 * @file writing.ts
 * @author Jimmy Kurian
 * @copyright Copyright (c) 2026 Jimmy Kurian. All rights reserved. See LICENSE.
 */
import type { CollectionEntry } from 'astro:content';
import { getOrdered } from './content';

/** A publication, patent or talk from `src/content/writing.json`. */
export type WritingItem = CollectionEntry<'writing'>;

const kindLabel: Record<WritingItem['data']['kind'], string> = {
  article: 'Article',
  chapter: 'Chapter',
  patent: 'Patent',
  talk: 'Talk',
};

/**
 * Every writing entry, newest first: the order of `src/content/writing.json`.
 *
 * @returns The writing entries, in file order.
 */
export async function getWriting(): Promise<WritingItem[]> {
  // File order; the JSON is kept newest first.
  return getOrdered('writing');
}

/**
 * The label a featured entry shows with on the home page.
 *
 * @param item - The writing entry.
 * @returns The year and kind, such as "2026 · Article".
 */
export function featuredLabel({ data }: WritingItem): string {
  return [data.year, kindLabel[data.kind]].filter(Boolean).join(' · ');
}

/**
 * The label an entry shows with on the writing page, where the section heading already names the kind.
 *
 * @param item - The writing entry.
 * @returns The year, for articles and chapters; otherwise the year and format, such as "2026 · Filed" or "Panel".
 */
export function listLabel({ data }: WritingItem): string {
  if (data.kind === 'article' || data.kind === 'chapter') return String(data.year ?? '');
  return [data.year, data.format].filter(Boolean).join(' · ');
}
