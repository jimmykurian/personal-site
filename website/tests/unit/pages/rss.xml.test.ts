/**
 * @file rss.xml.test.ts
 * @author Jimmy Kurian
 * @copyright Copyright (c) 2026 Jimmy Kurian. All rights reserved. See LICENSE.
 */

import { getCollection } from 'astro:content';
import type { APIContext } from 'astro';
import { describe, expect, it, vi } from 'vitest';
import { GET } from '../../../src/pages/rss.xml';
import { SITE } from '../../support/container';
import { collectionStub, post } from '../../support/content';

vi.mock('astro:content', async (importOriginal) => ({
  ...(await importOriginal<typeof import('astro:content')>()),
  getCollection: vi.fn(),
}));

const context = { site: new URL(SITE) } as APIContext;

describe('GET /rss.xml', () => {
  it('lists published posts newest first with absolute links', async () => {
    // Arrange
    vi.stubEnv('DEV', false);
    vi.mocked(getCollection).mockImplementation(
      collectionStub({
        posts: [
          post('first', { pubDate: new Date('2026-09-01'), tags: ['Leadership'] }),
          post('draft', { pubDate: new Date('2026-10-20'), draft: true }),
          post('second', { pubDate: new Date('2026-10-17'), title: 'Clean & simple', tags: ['.NET', 'CQRS'] }),
        ],
      }) as typeof getCollection,
    );

    // Act
    const response = await GET(context);
    const xml = await response.text();

    // Assert
    expect(response.headers.get('content-type')).toContain('application/xml');
    expect(xml).not.toContain('/writing/draft/');
    expect(xml.indexOf('/writing/second/')).toBeLessThan(xml.indexOf('/writing/first/'));
    expect(xml.replace(/<lastBuildDate>.*?<\/lastBuildDate>/, '')).toMatchSnapshot();
  });

  it('still returns a valid feed when there are no posts', async () => {
    // Arrange
    vi.mocked(getCollection).mockImplementation(collectionStub({ posts: [] }) as typeof getCollection);

    // Act
    const xml = await (await GET(context)).text();

    // Assert
    expect(xml).toContain('<title>Jimmy Kurian, writing</title>');
    expect(xml).toContain('<language>en-us</language>');
    expect(xml).not.toContain('<item>');
  });
});
