/**
 * @file links.test.ts
 * @author Jimmy Kurian
 * @copyright Copyright (c) 2026 Jimmy Kurian. All rights reserved. See LICENSE.
 */

import { describe, expect, it } from 'vitest';
import { fileFor, page, pages } from '../support/dist';

const SITE = 'https://www.jimmykurian.me';

// Files produced after the build by other steps.
const generatedLater = new Set(['/resume.pdf']);

/** Every internal URL a page references, from links, images, scripts and styles. */
function references(file: string): string[] {
  const root = page(file);
  const urls = [
    ...root.querySelectorAll('a[href], link[href]').map((el) => el.getAttribute('href')!),
    ...root.querySelectorAll('img[src], script[src]').map((el) => el.getAttribute('src')!),
    ...root.querySelectorAll('img[srcset], source[srcset]').flatMap((el) =>
      el
        .getAttribute('srcset')!
        .split(',')
        .map((s) => s.trim().split(/\s+/)[0]),
    ),
  ];
  return urls
    .map((url) => (url.startsWith(SITE) ? url.slice(SITE.length) || '/' : url))
    .filter((url) => url.startsWith('/') && !url.startsWith('//'));
}

describe('internal links', () => {
  it.each(pages().map((p) => [p.url, p.file]))('everything %s links to exists in the build', (_, file) => {
    // Arrange
    const urls = references(file).filter((url) => !generatedLater.has(url.split('#')[0]));

    // Act
    const missing = urls.filter((url) => !fileFor(url));

    // Assert
    expect(missing).toEqual([]);
  });

  it.each(pages().map((p) => [p.url, p.file]))('every #anchor %s links to has a matching id', (url, file) => {
    // Arrange
    const anchors = page(file)
      .querySelectorAll('a[href*="#"]')
      .map((a) => a.getAttribute('href')!)
      .filter((href) => href.startsWith('#') || href.startsWith('/'))
      .map((href) => {
        const [path, id] = href.split('#');
        return { target: fileFor(path || url)!, id };
      })
      .filter(({ id }) => id);

    // Act
    const missing = anchors.filter(({ target, id }) => !page(target).getElementById(decodeURIComponent(id)));

    // Assert
    expect(missing).toEqual([]);
  });

  it('links internal pages with a trailing slash, matching the canonical URLs', () => {
    // Arrange
    const hrefs = pages().flatMap(({ file }) =>
      page(file)
        .querySelectorAll('a[href^="/"]')
        .map((a) => a.getAttribute('href')!.split('#')[0])
        .filter((href) => href && !/\.\w+$/.test(href)),
    );

    // Act
    const withoutSlash = [...new Set(hrefs.filter((href) => !href.endsWith('/')))];

    // Assert
    expect(withoutSlash).toEqual([]);
  });
});
