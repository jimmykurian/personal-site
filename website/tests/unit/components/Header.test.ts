import { describe, expect, it } from 'vitest';
import Header from '../../../src/components/Header.astro';
import site from '../../../src/data/site.json';
import { dom, normalize, render } from '../../support/container';

const labels = ['Experience', 'Service', 'Projects', 'Writing', 'Reading', 'Teaching', 'Contact'];

describe('Header', () => {
  it('shows the wordmark, the primary nav and the resume link', async () => {
    // Arrange (default props)

    // Act
    const html = await render(Header);

    // Assert
    const root = dom(html);
    expect(root.querySelector('.wordmark')!.text).toBe(site.name);
    expect(root.querySelectorAll('.nav__link').map((a) => a.text.trim())).toEqual(labels);
    expect(root.querySelector('.nav__resume')!.getAttribute('href')).toBe('/#resume');
    expect(normalize(html)).toMatchSnapshot();
  });

  it('repeats the same links in the phone menu', async () => {
    // Arrange (default props)

    // Act
    const html = await render(Header);

    // Assert
    const root = dom(html);
    const wide = root.querySelectorAll('.nav__link').map((a) => a.getAttribute('href'));
    const menu = root.querySelectorAll('.menu__link').map((a) => a.getAttribute('href'));
    expect(menu).toEqual([...wide, '/#resume']);
  });

  it('marks the home wordmark as the current page by default', async () => {
    // Arrange (default props)

    // Act
    const html = await render(Header);

    // Assert
    const current = dom(html).querySelectorAll('[aria-current="page"]');
    expect(current.map((a) => a.text.trim())).toEqual([site.name]);
  });

  it.each([
    ['writing', '/writing/'],
    ['reading', '/reading/'],
  ] as const)('marks the %s link as current in both menus', async (current, href) => {
    // Arrange
    const props = { current };

    // Act
    const html = await render(Header, { props });

    // Assert
    const marked = dom(html).querySelectorAll('[aria-current="page"]');
    expect(marked.map((a) => a.getAttribute('href'))).toEqual([href, href]);
  });
});
