import { describe, expect, it } from 'vitest';
import PostList from '../../../src/components/PostList.astro';
import { post } from '../../support/content';
import { dom, normalize, render } from '../../support/container';

// Newest first, as getPosts returns them.
const posts = [
  post('november', { pubDate: new Date('2026-11-02'), title: 'November post' }),
  post('october-b', { pubDate: new Date('2026-10-17'), title: 'Second October post' }, 'word '.repeat(3680)),
  post('october-a', { pubDate: new Date('2026-10-01'), title: 'First October post', draft: true }),
  post('last-year', { pubDate: new Date('2025-12-31'), title: 'Last year' }),
];

describe('PostList', () => {
  it('groups posts by year, then month', async () => {
    // Arrange
    const props = { posts };

    // Act
    const html = await render(PostList, { props });

    // Assert
    const root = dom(html);
    const years = root.querySelectorAll('section.year');
    expect(years.map((y) => y.id)).toEqual(['y2026', 'y2025']);
    expect(years[0].querySelectorAll('section.month').map((m) => [m.id, m.getAttribute('aria-label')])).toEqual([
      ['2026-11', 'November 2026'],
      ['2026-10', 'October 2026'],
    ]);
    expect(
      root
        .querySelector('#2026-10')!
        .querySelectorAll('.post__title')
        .map((a) => a.getAttribute('href')),
    ).toEqual(['/writing/october-b/', '/writing/october-a/']);
    expect(normalize(html)).toMatchSnapshot();
  });

  it('builds the archive nav from the same groups', async () => {
    // Arrange
    const props = { posts };

    // Act
    const html = await render(PostList, { props });

    // Assert
    const links = dom(html).querySelectorAll('.archive-nav a');
    expect(links.map((a) => [a.getAttribute('href'), a.text.trim()])).toEqual([
      ['#y2026', '2026'],
      ['#2026-11', 'November'],
      ['#2026-10', 'October'],
      ['#y2025', '2025'],
      ['#2025-12', 'December'],
    ]);
  });

  it('shows the day in UTC and the reading time', async () => {
    // Arrange
    const props = { posts };

    // Act
    const html = await render(PostList, { props });

    // Assert
    const row = dom(html).querySelector('#2026-10 .row__date')!;
    expect(row.querySelector('time')!.getAttribute('datetime')).toBe('2026-10-17T00:00:00.000Z');
    expect(row.text.replace(/\s+/g, ' ').trim()).toBe('Oct 17 · 16 min');
  });

  it('marks drafts', async () => {
    // Arrange
    const props = { posts };

    // Act
    const html = await render(PostList, { props });

    // Assert
    const drafts = dom(html).querySelectorAll('.post__draft');
    expect(drafts).toHaveLength(1);
    expect(drafts[0].closest('a')!.getAttribute('href')).toBe('/writing/october-a/');
  });

  it('points to the feed when there are no posts', async () => {
    // Arrange
    const props = { posts: [] };

    // Act
    const html = await render(PostList, { props });

    // Assert
    const root = dom(html);
    expect(root.querySelector('.empty')!.text).toContain('No posts yet.');
    expect(root.querySelector('.archive-nav')).toBeNull();
  });
});
