/**
 * @file assets.test.ts
 * @author Jimmy Kurian
 * @copyright Copyright (c) 2026 Jimmy Kurian. All rights reserved. See LICENSE.
 */

import { describe, expect, it } from 'vitest';
import { files, page, pages, read } from '../support/dist';

describe('assets', () => {
  it('serves fonts, styles, scripts and images from the site, with no third-party requests', () => {
    // Arrange
    const html = pages().map(({ file }) => page(file));

    // Act
    const external = html
      .flatMap((root) => [
        ...root
          .querySelectorAll('img[src], script[src], source[srcset]')
          .map((el) => el.getAttribute('src') ?? el.getAttribute('srcset')!),
        ...root.querySelectorAll('link[rel="stylesheet"], link[rel="preload"]').map((el) => el.getAttribute('href')!),
      ])
      .filter((url) => /^(https?:)?\/\//.test(url));

    // Assert
    expect(external).toEqual([]);
  });

  it('bundles the fonts as woff2 files and references no font CDN', () => {
    // Arrange
    const css = files()
      .filter((f) => f.endsWith('.css'))
      .map(read)
      .join('\n');
    const html = pages()
      .map(({ file }) => read(file))
      .join('\n');

    // Act
    const fonts = files().filter((f) => f.endsWith('.woff2'));

    // Assert
    expect(fonts.length).toBeGreaterThan(0);
    expect(css + html).not.toMatch(/fonts\.(googleapis|gstatic)\.com/);
  });

  it('downloads Goodreads covers at build time instead of hot-linking them', () => {
    // Arrange
    const reading = page('/reading/index.html');

    // Act
    const covers = reading.querySelectorAll('img').map((img) => img.getAttribute('src')!);

    // Assert
    expect(covers.length).toBeGreaterThan(0);
    expect(covers.every((src) => src.startsWith('/_astro/'))).toBe(true);
    expect(read('/reading/index.html')).not.toContain('gr-assets.com');
  });

  it('gives every image alt text, empty only for decorative ones', () => {
    // Arrange
    const images = pages().flatMap(({ url, file }) =>
      page(file)
        .querySelectorAll('img')
        .map((img) => ({ url, img })),
    );

    // Act
    const missing = images
      .filter(({ img }) => !img.hasAttribute('alt'))
      .map(({ url, img }) => `${url} ${img.getAttribute('src')}`);

    // Assert
    expect(missing).toEqual([]);
  });

  it('ships the favicon and the default link-preview image', () => {
    // Arrange
    const published = files();

    // Act
    const present = ['/favicon.svg', '/og-default.png'].filter((f) => published.includes(f));

    // Assert
    expect(present).toEqual(['/favicon.svg', '/og-default.png']);
  });
});
