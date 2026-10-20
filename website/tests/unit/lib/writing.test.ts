/**
 * @file writing.test.ts
 * @author Jimmy Kurian
 * @copyright Copyright (c) 2026 Jimmy Kurian. All rights reserved. See LICENSE.
 */

import { getCollection } from 'astro:content';
import { describe, expect, it, vi } from 'vitest';
import { featuredLabel, getWriting, listLabel } from '../../../src/lib/writing';
import writing from '../../../src/content/writing.json';
import { collectionStub, realEntries, writingItem } from '../../support/content';

vi.mock('astro:content', async (importOriginal) => ({
  ...(await importOriginal<typeof import('astro:content')>()),
  getCollection: vi.fn(),
}));

describe('getWriting', () => {
  it('returns writing.json entries in file order', async () => {
    // Arrange
    const shuffled = [...realEntries('writing')].reverse();
    vi.mocked(getCollection).mockImplementation(collectionStub({ writing: shuffled }) as typeof getCollection);

    // Act
    const result = await getWriting();

    // Assert
    expect(result.map((w) => w.id)).toEqual(writing.map((w) => w.id));
  });
});

describe('featuredLabel', () => {
  it.each([
    ['article', { kind: 'article', year: 2026 }, '2026 · Article'],
    ['chapter', { kind: 'chapter', year: 2025 }, '2025 · Chapter'],
    ['patent', { kind: 'patent', year: 2024, format: 'Filed' }, '2024 · Patent'],
    ['talk', { kind: 'talk', year: 2023, format: 'Panel' }, '2023 · Talk'],
    ['undated talk', { kind: 'talk' }, 'Talk'],
  ] as const)('labels an %s with its year and kind', (_, data, expected) => {
    // Arrange
    const item = writingItem('x', data);

    // Act
    const label = featuredLabel(item);

    // Assert
    expect(label).toBe(expected);
  });
});

describe('listLabel', () => {
  it.each([
    ['article', { kind: 'article', year: 2026 }, '2026'],
    ['chapter', { kind: 'chapter', year: 2025 }, '2025'],
    ['undated article', { kind: 'article' }, ''],
    ['patent', { kind: 'patent', year: 2024, format: 'Filed' }, '2024 · Filed'],
    ['talk', { kind: 'talk', year: 2023, format: 'Panel' }, '2023 · Panel'],
    ['undated talk', { kind: 'talk', format: 'Roundtable' }, 'Roundtable'],
  ] as const)('labels an %s without repeating the section heading', (_, data, expected) => {
    // Arrange
    const item = writingItem('x', data);

    // Act
    const label = listLabel(item);

    // Assert
    expect(label).toBe(expected);
  });
});
