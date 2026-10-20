import { describe, expect, it } from 'vitest';
import NotFound from '../../../src/pages/404.astro';
import site from '../../../src/data/site.json';
import { dom, normalize, render } from '../../support/container';

describe('404 page', () => {
  it('says the page is missing and links back to the home page and writing', async () => {
    // Arrange
    const path = '/no-such-page/';

    // Act
    const html = await render(NotFound, { path });

    // Assert
    const root = dom(html);
    expect(root.querySelector('title')!.text).toBe(`Not found · ${site.name}`);
    expect(root.querySelector('h1')!.text).toBe('Nothing here.');
    expect(root.querySelectorAll('.missing__text a').map((a) => a.getAttribute('href'))).toEqual(['/', '/writing/']);
    expect(root.querySelector('meta[name="robots"]')!.getAttribute('content')).toBe('noindex');
    expect(root.querySelector('link[rel="canonical"]')).toBeNull();
    expect(normalize(root.querySelector('main')!.innerHTML)).toMatchSnapshot();
  });
});
