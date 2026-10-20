/**
 * @file feeds.test.ts
 * @author Jimmy Kurian
 * @copyright Copyright (c) 2026 Jimmy Kurian. All rights reserved. See LICENSE.
 */

import { describe, expect, it } from 'vitest';
import { fileFor, files, publishedPostIds, read } from '../support/dist';

const SITE = 'https://www.jimmykurian.me';

// The feed and sitemap are small, generated XML, so plain patterns read them reliably.
const blocks = (xml: string, tag: string) =>
  [...xml.matchAll(new RegExp(`<${tag}>([\\s\\S]*?)</${tag}>`, 'g'))].map((m) => m[1]);
const field = (xml: string, tag: string) => (blocks(xml, tag)[0] ?? '').replace(/^<!\[CDATA\[|\]\]>$/g, '').trim();

describe('RSS feed', () => {
  it('lists every published post with an absolute link to a built page', () => {
    // Arrange
    const feed = read('/rss.xml');

    // Act
    const links = blocks(feed, 'item').map((item) => field(item, 'link'));

    // Assert
    expect(links.sort()).toEqual(publishedPostIds().map((id) => `${SITE}/writing/${id}/`));
    expect(links.every((link) => fileFor(link.slice(SITE.length)))).toBe(true);
  });

  it('describes the channel', () => {
    // Arrange
    const channel = blocks(read('/rss.xml'), 'channel')[0].replace(/<item>[\s\S]*<\/item>/, '');

    // Act
    const [title, link, language] = ['title', 'link', 'language'].map((tag) => field(channel, tag));

    // Assert
    expect(title).toBe('Jimmy Kurian, writing');
    expect(link).toBe(`${SITE}/`);
    expect(language).toBe('en-us');
  });

  it('gives each item a title, description and publish date', () => {
    // Arrange
    const items = blocks(read('/rss.xml'), 'item');

    // Act
    const incomplete = items.filter(
      (item) =>
        !field(item, 'title') || !field(item, 'description') || Number.isNaN(Date.parse(field(item, 'pubDate'))),
    );

    // Assert
    expect(items.length).toBeGreaterThan(0);
    expect(incomplete).toHaveLength(0);
  });
});

describe('sitemap', () => {
  const urls = () =>
    files()
      .filter((f) => /^\/sitemap-\d+\.xml$/.test(f))
      .flatMap((f) => blocks(read(f), 'loc'))
      .sort();

  it('indexes the sitemap files that exist', () => {
    // Arrange
    const index = read('/sitemap-index.xml');

    // Act
    const listed = blocks(index, 'loc').map((loc) => loc.slice(SITE.length));

    // Assert
    expect(listed.length).toBeGreaterThan(0);
    expect(listed.every((path) => fileFor(path))).toBe(true);
  });

  it('lists every public page on the www host, without the resume print page or the 404', () => {
    // Arrange
    const expected = ['/', '/reading/', '/writing/', ...publishedPostIds().map((id) => `/writing/${id}/`)]
      .map((p) => SITE + p)
      .sort();

    // Act
    const listed = urls();

    // Assert
    expect(listed).toEqual(expected);
  });
});
