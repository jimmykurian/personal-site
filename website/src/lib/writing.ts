import type { CollectionEntry } from 'astro:content';
import { getOrdered } from './content';

export type WritingItem = CollectionEntry<'writing'>;

const kindLabel: Record<WritingItem['data']['kind'], string> = {
  article: 'Article',
  chapter: 'Chapter',
  patent: 'Patent',
  talk: 'Talk',
};

export async function getWriting(): Promise<WritingItem[]> {
  // File order; the JSON is kept newest first.
  return getOrdered('writing');
}

/** Home page label: "2026 · Article". */
export function featuredLabel({ data }: WritingItem): string {
  return [data.year, kindLabel[data.kind]].filter(Boolean).join(' · ');
}

/** Writing page label, where the section heading already names the kind: "2026", "2026 · Filed", "Panel". */
export function listLabel({ data }: WritingItem): string {
  if (data.kind === 'article' || data.kind === 'chapter') return String(data.year ?? '');
  return [data.year, data.format].filter(Boolean).join(' · ');
}
