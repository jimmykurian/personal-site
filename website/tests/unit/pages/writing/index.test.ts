/**
 * @file index.test.ts
 * @author Jimmy Kurian
 * @copyright Copyright (c) 2026 Jimmy Kurian. All rights reserved. See LICENSE.
 */

import { getCollection } from 'astro:content';
import { describe, expect, it, vi } from 'vitest';
import WritingPage from '../../../../src/pages/writing/index.astro';
import { dom, render } from '../../../support/container';
import { collectionStub, post, writingItem } from '../../../support/content';

vi.mock('astro:content', async (importOriginal) => ({
  ...(await importOriginal<typeof import('astro:content')>()),
  getCollection: vi.fn(),
}));

const writing = [
  writingItem('article', { kind: 'article', year: 2026, href: 'https://example.com/a' }),
  writingItem('chapter', { kind: 'chapter', year: 2025 }),
  writingItem('patent', { kind: 'patent', year: 2024, format: 'Filed' }),
  writingItem('talk', { kind: 'talk', year: 2023, format: 'Panel' }),
];

async function renderPage() {
  vi.mocked(getCollection).mockImplementation(
    collectionStub({ posts: [post('hello', { title: 'Hello' })], writing }) as typeof getCollection,
  );
  return dom(await render(WritingPage, { path: '/writing/' }));
}

describe('writing page', () => {
  it('opens with the hero and marks Writing as the current page', async () => {
    // Arrange (fixture posts and writing)

    // Act
    const root = await renderPage();

    // Assert
    expect(root.querySelector('title')!.text).toBe('Writing · Jimmy Kurian');
    expect(root.querySelector('h1')!.innerHTML).toBe('Writing, patents <em>and</em> talks.');
    expect(root.querySelector('.nav__link[aria-current="page"]')!.getAttribute('href')).toBe('/writing/');
  });

  it('lists the posts', async () => {
    // Arrange (fixture posts and writing)

    // Act
    const root = await renderPage();

    // Assert
    expect(root.querySelectorAll('#posts .post__title').map((a) => a.getAttribute('href'))).toEqual([
      '/writing/hello/',
    ]);
  });

  it('splits the rest into publications, patents and talks', async () => {
    // Arrange (fixture posts and writing)

    // Act
    const root = await renderPage();

    // Assert
    const section = (id: string) =>
      root.querySelectorAll(`#${id} .row`).map((r) => r.querySelector('.row__date')!.text);
    expect(section('publications')).toEqual(['2026', '2025']);
    expect(section('patents')).toEqual(['2024 · Filed']);
    expect(section('talks')).toEqual(['2023 · Panel']);
  });

  it('links a title only when it has a URL', async () => {
    // Arrange (fixture posts and writing)

    // Act
    const root = await renderPage();

    // Assert
    const titles = root.querySelectorAll('#publications .list-title');
    expect(titles.map((t) => [t.tagName, t.getAttribute('href')])).toEqual([
      ['A', 'https://example.com/a'],
      ['P', undefined],
    ]);
  });
});
