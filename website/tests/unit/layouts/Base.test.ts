import { describe, expect, it } from 'vitest';
import Base from '../../../src/layouts/Base.astro';
import site from '../../../src/data/site.json';
import { SITE, dom, render } from '../../support/container';

const meta = (html: string, key: string) =>
  dom(html).querySelector(`meta[property="${key}"], meta[name="${key}"]`)?.getAttribute('content');

describe('Base', () => {
  it('uses the site title and description when the page sets none', async () => {
    // Arrange (no props)

    // Act
    const html = await render(Base);

    // Assert
    expect(dom(html).querySelector('title')!.text).toBe(site.title);
    expect(meta(html, 'description')).toBe(site.description);
    expect(meta(html, 'og:title')).toBe(site.title);
    expect(meta(html, 'og:type')).toBe('website');
  });

  it('suffixes a page title with the name', async () => {
    // Arrange
    const props = { title: 'Writing', description: 'Posts and talks.' };

    // Act
    const html = await render(Base, { props, path: '/writing/' });

    // Assert
    expect(dom(html).querySelector('title')!.text).toBe(`Writing · ${site.name}`);
    expect(meta(html, 'og:title')).toBe('Writing');
    expect(meta(html, 'description')).toBe('Posts and talks.');
  });

  it('points the canonical and og:url at the page on the www host', async () => {
    // Arrange
    const path = '/writing/some-post/';

    // Act
    const html = await render(Base, { path });

    // Assert
    expect(dom(html).querySelector('link[rel="canonical"]')!.getAttribute('href')).toBe(`${SITE}${path}`);
    expect(meta(html, 'og:url')).toBe(`${SITE}${path}`);
    expect(meta(html, 'og:image')).toBe(`${SITE}/og-default.png`);
  });

  it('uses an explicit canonical for posts first published elsewhere', async () => {
    // Arrange
    const props = { canonical: 'https://example.com/original/' };

    // Act
    const html = await render(Base, { props, path: '/writing/x/' });

    // Assert
    expect(dom(html).querySelector('link[rel="canonical"]')!.getAttribute('href')).toBe(
      'https://example.com/original/',
    );
  });

  it('keeps a noindex page out of search results, with no canonical URL', async () => {
    // Arrange
    const props = { noindex: true };

    // Act
    const html = await render(Base, { props, path: '/404/' });

    // Assert
    const root = dom(html);
    expect(meta(html, 'robots')).toBe('noindex');
    expect(root.querySelector('link[rel="canonical"]')).toBeNull();
    expect(meta(html, 'og:url')).toBeUndefined();
  });

  it('lets pages be indexed by default', async () => {
    // Arrange (no props)

    // Act
    const html = await render(Base);

    // Assert
    expect(meta(html, 'robots')).toBeUndefined();
  });

  it('marks articles with their publish time', async () => {
    // Arrange
    const props = { type: 'article' as const, publishedTime: new Date('2026-10-17') };

    // Act
    const html = await render(Base, { props });

    // Assert
    expect(meta(html, 'og:type')).toBe('article');
    expect(meta(html, 'article:published_time')).toBe('2026-10-17T00:00:00.000Z');
  });

  it('adds Person structured data on the home page only', async () => {
    // Arrange
    const home = { current: 'home' as const };
    const writing = { current: 'writing' as const };

    // Act
    const homeHtml = await render(Base, { props: home });
    const writingHtml = await render(Base, { props: writing });

    // Assert
    const ld = JSON.parse(dom(homeHtml).querySelector('script[type="application/ld+json"]')!.text);
    expect(ld).toMatchObject({ '@type': 'Person', name: site.name, url: `${SITE}/` });
    expect(ld.sameAs).toEqual([site.links.linkedin, site.links.github, site.links.stackoverflow]);
    expect(ld.address).toEqual({ '@type': 'PostalAddress', addressLocality: 'Chicago', addressRegion: 'IL' });
    expect(dom(writingHtml).querySelector('script[type="application/ld+json"]')).toBeNull();
  });

  it('links the feed, sitemap and favicon, and wraps the page in header, main and footer', async () => {
    // Arrange
    const slots = { default: '<p class="page-body">Body</p>' };

    // Act
    const html = await render(Base, { slots, props: { current: 'reading' } });

    // Assert
    const root = dom(html);
    expect(root.querySelector('link[rel="alternate"]')!.getAttribute('href')).toBe('/rss.xml');
    expect(root.querySelector('link[rel="sitemap"]')!.getAttribute('href')).toBe('/sitemap-index.xml');
    expect(root.querySelector('link[rel="icon"]')!.getAttribute('href')).toBe('/favicon.svg');
    expect(root.querySelector('.skip-link')!.getAttribute('href')).toBe('#main');
    expect(root.querySelector('main#main .page-body')).not.toBeNull();
    expect(root.querySelector('header.site-header [aria-current="page"]')!.getAttribute('href')).toBe('/reading/');
    expect(root.querySelector('footer.site-footer')).not.toBeNull();
  });
});
