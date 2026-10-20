import { describe, expect, it } from 'vitest';
import site from '../../src/data/site.json';
import { fileFor, page, pages, publishedPostIds } from '../support/dist';

const SITE = 'https://www.jimmykurian.me';

describe('built pages', () => {
  it('builds every route, one page per published post, and no drafts', () => {
    // Arrange
    const posts = publishedPostIds().map((id) => `/writing/${id}/`);
    const expected = ['/', '/404.html', '/reading/', '/resume/', '/writing/', ...posts].sort();

    // Act
    const urls = pages()
      .map((p) => p.url)
      .sort();

    // Assert
    expect(urls).toEqual(expected);
    expect(fileFor('/writing/draft-template/')).toBeUndefined();
  });

  it.each(pages().map((p) => [p.url, p.file]))('%s is a complete, labelled HTML document', (_, file) => {
    // Arrange
    const root = page(file);

    // Act
    const html = root.querySelector('html')!;
    const h1s = root.querySelectorAll('h1');

    // Assert
    expect(html.getAttribute('lang')).toBe('en');
    expect(root.querySelector('title')?.text.trim()).toBeTruthy();
    expect(root.querySelector('meta[name="viewport"]')).not.toBeNull();
    expect(h1s).toHaveLength(1);
  });

  const indexed = () => pages().filter((p) => p.url !== '/resume/' && p.url !== '/404.html');

  it.each(indexed().map((p) => [p.url, p.file]))(
    '%s has a description, canonical URL and link preview on the www host',
    (url, file) => {
      // Arrange
      const root = page(file);

      // Act
      const canonical = root.querySelector('link[rel="canonical"]')!.getAttribute('href')!;
      const meta = (key: string) => root.querySelector(`meta[property="${key}"]`)?.getAttribute('content');

      // Assert
      expect(root.querySelector('meta[name="description"]')!.getAttribute('content')).toBeTruthy();
      expect(canonical).toBe(`${SITE}${url}`);
      expect(meta('og:url')).toBe(canonical);
      expect(meta('og:image')).toBe(`${SITE}/og-default.png`);
    },
  );

  it.each(['/resume/index.html', '/404.html'])('keeps %s out of search results, with no canonical URL', (file) => {
    // Arrange
    const root = page(file);

    // Act
    const robots = root.querySelector('meta[name="robots"]')?.getAttribute('content');

    // Assert
    expect(robots).toBe('noindex');
    expect(root.querySelector('link[rel="canonical"]')).toBeNull();
  });

  it('marks the current section in the nav on each page', () => {
    // Arrange
    const expected = { '/writing/index.html': '/writing/', '/reading/index.html': '/reading/' };

    // Act
    const current = Object.keys(expected).map((file) =>
      page(file).querySelector('.nav__link[aria-current="page"]')?.getAttribute('href'),
    );

    // Assert
    expect(current).toEqual(Object.values(expected));
  });

  it('adds Person structured data to the home page only', () => {
    // Arrange
    const withLd = pages().filter(({ file }) => page(file).querySelector('script[type="application/ld+json"]'));

    // Act
    const ld = JSON.parse(page('/index.html').querySelector('script[type="application/ld+json"]')!.text);

    // Assert
    expect(withLd.map((p) => p.url)).toEqual(['/']);
    expect(ld).toMatchObject({ '@type': 'Person', name: site.name, url: `${SITE}/` });
  });
});
