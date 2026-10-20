/**
 * @file content.test.ts
 * @author Jimmy Kurian
 * @copyright Copyright (c) 2026 Jimmy Kurian. All rights reserved. See LICENSE.
 */

import { getCollection } from 'astro:content';
import { describe, expect, it, vi } from 'vitest';
import { getOrdered } from '../../../src/lib/content';
import experience from '../../../src/content/experience.json';
import writing from '../../../src/content/writing.json';
import { collectionStub, realEntries } from '../../support/content';

vi.mock('astro:content', async (importOriginal) => ({
  ...(await importOriginal<typeof import('astro:content')>()),
  getCollection: vi.fn(),
}));

describe('getOrdered', () => {
  it.each([
    ['experience', experience],
    ['writing', writing],
  ] as const)('restores the order of %s.json, whatever order the loader returns', async (name, file) => {
    // Arrange
    const shuffled = [...realEntries(name)].reverse();
    vi.mocked(getCollection).mockImplementation(collectionStub({ [name]: shuffled }) as typeof getCollection);

    // Act
    const result = await getOrdered(name);

    // Assert
    expect(result.map((e) => e.id)).toEqual(file.map((e) => e.id));
  });

  it('reads the collection it is asked for', async () => {
    // Arrange
    vi.mocked(getCollection).mockImplementation(collectionStub({ projects: [] }) as typeof getCollection);

    // Act
    await getOrdered('projects');

    // Assert
    expect(getCollection).toHaveBeenCalledWith('projects');
  });
});
