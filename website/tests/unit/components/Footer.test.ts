import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import Footer from '../../../src/components/Footer.astro';
import site from '../../../src/data/site.json';
import { dom, normalize, render } from '../../support/container';

describe('Footer', () => {
  beforeEach(() => {
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(new Date('2026-10-17T12:00:00Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('shows the current year, name and city', async () => {
    // Arrange (clock set to 2026)

    // Act
    const html = await render(Footer);

    // Assert
    expect(dom(html).querySelector('.site-footer__inner p')!.text).toBe(`© 2026 ${site.name} · ${site.location}`);
    expect(normalize(html)).toMatchSnapshot();
  });

  it('links the RSS feed and Lichess, and no source repository', async () => {
    // Arrange (no props)

    // Act
    const html = await render(Footer);

    // Assert
    const root = dom(html);
    const hrefs = root.querySelectorAll('a').map((a) => a.getAttribute('href'));
    expect(hrefs).toEqual(['/rss.xml', site.links.lichess]);
    expect(root.querySelector('.site-footer__icon')!.getAttribute('aria-label')).toBe('Chess on Lichess');
    expect(root.querySelector('.site-footer__clock')!.text).toContain('Off the clock:');
    expect(html).not.toContain('github.com');
  });
});
