/**
 * @file content.ts
 * @author Jimmy Kurian
 * @copyright Copyright (c) 2026 Jimmy Kurian. All rights reserved. See LICENSE.
 */

import type { CollectionEntry, CollectionKey } from 'astro:content';
import { collections } from '../../src/content.config';
import experience from '../../src/content/experience.json';
import projects from '../../src/content/projects.json';
import teaching from '../../src/content/teaching.json';
import writing from '../../src/content/writing.json';

const files = { experience, projects, teaching, writing };

type FileCollection = keyof typeof files;

/**
 * The real entries of a JSON collection, parsed through its schema (so defaults apply), in
 * file order. Rendering pages with these checks the content rules against the actual data.
 */
export function realEntries<C extends FileCollection>(collection: C): CollectionEntry<C>[] {
  const schema = (collections[collection] as unknown as { schema: { parse: (v: unknown) => unknown } }).schema;
  return files[collection].map(({ id, ...data }) => ({
    id,
    collection,
    data: schema.parse(data),
  })) as unknown as CollectionEntry<C>[];
}

/** A `getCollection` stand-in that serves fixed entries and applies the filter, as Astro does. */
export function collectionStub(entries: Partial<Record<CollectionKey, unknown[]>>) {
  return async (collection: CollectionKey, filter?: (entry: never) => unknown) => {
    const list = (entries[collection] ?? []) as never[];
    return filter ? list.filter(filter) : list;
  };
}

/** A blog post entry with sensible defaults. */
export function post(id: string, data: Partial<CollectionEntry<'posts'>['data']> = {}, body = 'word '.repeat(460)) {
  return {
    id,
    collection: 'posts',
    body,
    data: {
      title: `Post ${id}`,
      description: `About ${id}.`,
      pubDate: new Date('2026-10-17'),
      tags: [],
      draft: false,
      ...data,
    },
  } as CollectionEntry<'posts'>;
}

/** A Goodreads book entry with sensible defaults. */
export function book(id: string, data: Partial<CollectionEntry<'books'>['data']> = {}) {
  return {
    id,
    collection: 'books',
    data: {
      shelf: 'software-engineering',
      position: 0,
      title: `Book ${id}`,
      author: `Author ${id}`,
      rating: 0,
      toRead: false,
      readAt: null,
      addedAt: new Date('2026-01-01'),
      href: `https://www.goodreads.com/book/show/${id}`,
      ...data,
    },
  } as CollectionEntry<'books'>;
}

/** A writing.json entry with sensible defaults. */
export function writingItem(id: string, data: Partial<CollectionEntry<'writing'>['data']> = {}) {
  return {
    id,
    collection: 'writing',
    data: { kind: 'article', title: `Title ${id}`, venue: `Venue ${id}`, featured: false, ...data },
  } as CollectionEntry<'writing'>;
}
