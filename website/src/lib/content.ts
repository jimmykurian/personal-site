/**
 * Reads the JSON content collections in the order their files list them.
 *
 * @packageDocumentation
 * @file content.ts
 * @author Jimmy Kurian
 * @copyright Copyright (c) 2026 Jimmy Kurian. All rights reserved. See LICENSE.
 */
import { getCollection, type CollectionEntry } from 'astro:content';
import experience from '../content/experience.json';
import projects from '../content/projects.json';
import teaching from '../content/teaching.json';
import writing from '../content/writing.json';

// file() loader entries come back keyed by id, not in file order. The JSON files are
// ordered on purpose (same order as the resume), so restore it from the source arrays.
const sources = { experience, projects, teaching, writing };

/** The collections loaded from an ordered JSON file. */
type Ordered = keyof typeof sources;

/**
 * Every entry of a JSON collection, in the order its source file lists them.
 *
 * @param collection - The collection to read: `experience`, `projects`, `teaching` or `writing`.
 * @returns The collection's entries, in file order.
 */
export async function getOrdered<C extends Ordered>(collection: C): Promise<CollectionEntry<C>[]> {
  const order = sources[collection].map((e) => e.id);
  const entries = (await getCollection(collection)) as CollectionEntry<C>[];
  return entries.sort((a, b) => order.indexOf(a.id) - order.indexOf(b.id));
}
