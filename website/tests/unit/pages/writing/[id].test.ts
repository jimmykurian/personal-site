/**
 * @file [id].test.ts
 * @author Jimmy Kurian
 * @copyright Copyright (c) 2026 Jimmy Kurian. All rights reserved. See LICENSE.
 */

import { getCollection, render as renderEntry } from 'astro:content';
import { describe, expect, it, vi } from 'vitest';
import PostPage, { getStaticPaths } from '../../../../src/pages/writing/[id].astro';
import PostContent from '../../../support/fixtures/PostContent.astro';
import { dom, render } from '../../../support/container';
import { collectionStub, post } from '../../../support/content';

vi.mock('astro:content', async (importOriginal) => ({
  ...(await importOriginal<typeof import('astro:content')>()),
  getCollection: vi.fn(),
  render: vi.fn(),
}));

async function renderPost(entry: ReturnType<typeof post>) {
  vi.mocked(renderEntry).mockResolvedValue({ Content: PostContent } as never);
  return dom(
    await render(PostPage, { props: { post: entry }, params: { id: entry.id }, path: `/writing/${entry.id}/` }),
  );
}

describe('post page', () => {
  it('builds one page per published post', async () => {
    // Arrange
    vi.stubEnv('DEV', false);
    const posts = [post('a', { pubDate: new Date('2026-09-01') }), post('b', { draft: true }), post('c')];
    vi.mocked(getCollection).mockImplementation(collectionStub({ posts }) as typeof getCollection);

    // Act
    const paths = await getStaticPaths();

    // Assert
    expect(paths.map((p) => p.params.id)).toEqual(['c', 'a']);
    expect(paths[0].props.post.id).toBe('c');
  });

  it('shows the title, description, date, reading time and tags, then the body', async () => {
    // Arrange
    const entry = post(
      'clean',
      { title: 'Clean Architecture', description: 'A case study.', tags: ['.NET', 'CQRS'] },
      'word '.repeat(3680),
    );

    // Act
    const root = await renderPost(entry);

    // Assert
    expect(root.querySelector('title')!.text).toBe('Clean Architecture · Jimmy Kurian');
    expect(root.querySelector('h1#post-title')!.text).toBe('Clean Architecture');
    expect(root.querySelector('.post__dek')!.text).toBe('A case study.');
    expect(root.querySelector('.post__meta time')!.text).toBe('October 17, 2026');
    expect(root.querySelector('.post__meta')!.text).toContain('16 min read');
    expect(root.querySelectorAll('.post__tags span').map((s) => s.text)).toEqual(['.NET', 'CQRS']);
    expect(root.querySelector('.prose .fixture-body')).not.toBeNull();
    expect(renderEntry).toHaveBeenCalledWith(entry);
  });

  it('is an article for link previews, under Writing in the nav', async () => {
    // Arrange
    const entry = post('clean');

    // Act
    const root = await renderPost(entry);

    // Assert
    expect(root.querySelector('meta[property="og:type"]')!.getAttribute('content')).toBe('article');
    expect(root.querySelector('meta[property="article:published_time"]')!.getAttribute('content')).toBe(
      '2026-10-17T00:00:00.000Z',
    );
    expect(root.querySelector('.nav__link[aria-current="page"]')!.getAttribute('href')).toBe('/writing/');
    expect(root.querySelector('.post__back')!.getAttribute('href')).toBe('/writing/');
  });

  it('shows the updated date when there is one', async () => {
    // Arrange
    const entry = post('clean', { updatedDate: new Date('2026-11-01') });

    // Act
    const root = await renderPost(entry);

    // Assert
    expect(root.querySelectorAll('.post__meta time').map((t) => t.text)).toEqual([
      'October 17, 2026',
      'November 1, 2026',
    ]);
  });

  it('credits the original and points the canonical at it for syndicated posts', async () => {
    // Arrange
    const entry = post('clean', { canonical: 'https://www.infoq.com/articles/example/' });

    // Act
    const root = await renderPost(entry);

    // Assert
    expect(root.querySelector('link[rel="canonical"]')!.getAttribute('href')).toBe(
      'https://www.infoq.com/articles/example/',
    );
    expect(root.querySelector('.post__meta a')!.text).toBe('www.infoq.com');
  });

  it('labels drafts and leaves out empty tags and the canonical credit', async () => {
    // Arrange
    const entry = post('clean', { draft: true });

    // Act
    const root = await renderPost(entry);

    // Assert
    expect(root.querySelector('.post__meta .caps')!.text).toBe('Draft');
    expect(root.querySelector('.post__tags')).toBeNull();
    expect(root.querySelector('.post__meta a')).toBeNull();
    expect(root.querySelector('link[rel="canonical"]')!.getAttribute('href')).toBe(
      'https://www.jimmykurian.me/writing/clean/',
    );
  });
});
