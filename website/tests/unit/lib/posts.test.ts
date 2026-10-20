/**
 * @file posts.test.ts
 * @author Jimmy Kurian
 * @copyright Copyright (c) 2026 Jimmy Kurian. All rights reserved. See LICENSE.
 */

import { getCollection } from 'astro:content';
import { describe, expect, it, vi } from 'vitest';
import { formatDate, getPosts, readingMinutes } from '../../../src/lib/posts';
import { collectionStub, post } from '../../support/content';

vi.mock('astro:content', async (importOriginal) => ({
  ...(await importOriginal<typeof import('astro:content')>()),
  getCollection: vi.fn(),
}));

const posts = [
  post('older', { pubDate: new Date('2026-08-01') }),
  post('draft', { pubDate: new Date('2026-10-01'), draft: true }),
  post('newest', { pubDate: new Date('2026-09-15') }),
];

describe('getPosts', () => {
  it('returns published posts newest first and leaves drafts out of production builds', async () => {
    // Arrange
    vi.mocked(getCollection).mockImplementation(collectionStub({ posts }) as typeof getCollection);
    vi.stubEnv('DEV', false);

    // Act
    const result = await getPosts();

    // Assert
    expect(result.map((p) => p.id)).toEqual(['newest', 'older']);
    expect(getCollection).toHaveBeenCalledWith('posts', expect.any(Function));
  });

  it('includes drafts in the dev server', async () => {
    // Arrange
    vi.mocked(getCollection).mockImplementation(collectionStub({ posts }) as typeof getCollection);
    vi.stubEnv('DEV', true);

    // Act
    const result = await getPosts();

    // Assert
    expect(result.map((p) => p.id)).toEqual(['draft', 'newest', 'older']);
  });
});

describe('readingMinutes', () => {
  it.each([
    ['an empty body', '', 1],
    ['a short note', 'a few words only', 1],
    ['230 words', 'word '.repeat(230), 1],
    ['460 words', 'word '.repeat(460), 2],
    ['575 words, rounding half up', 'word '.repeat(575), 3],
  ])('estimates %s at 230 words a minute, never under a minute', (_, body, expected) => {
    // Arrange (inputs from the table)

    // Act
    const minutes = readingMinutes(body);

    // Assert
    expect(minutes).toBe(expected);
  });

  it('ignores fenced code blocks', () => {
    // Arrange
    const prose = 'word '.repeat(460);
    const code = '```ts\n' + 'const x = 1;\n'.repeat(500) + '```';

    // Act
    const minutes = readingMinutes(`${prose}\n${code}`);

    // Assert
    expect(minutes).toBe(2);
  });

  it('ignores MDX comments, such as the copyright header', () => {
    // Arrange
    const prose = 'word '.repeat(460);
    const comment = `{/* ${'note '.repeat(300)} */}`;

    // Act
    const minutes = readingMinutes(`${comment}\n${prose}`);

    // Assert
    expect(minutes).toBe(2);
  });

  it('treats a missing body as empty', () => {
    // Arrange (no body)

    // Act
    const minutes = readingMinutes();

    // Assert
    expect(minutes).toBe(1);
  });
});

describe('formatDate', () => {
  it('formats the calendar day in UTC, so frontmatter dates never shift by a day', () => {
    // Arrange
    const date = new Date('2026-10-17'); // midnight UTC, the evening before in Chicago

    // Act
    const label = formatDate(date);

    // Assert
    expect(label).toBe('October 17, 2026');
  });
});
