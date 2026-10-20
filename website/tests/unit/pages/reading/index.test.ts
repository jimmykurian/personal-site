/**
 * @file index.test.ts
 * @author Jimmy Kurian
 * @copyright Copyright (c) 2026 Jimmy Kurian. All rights reserved. See LICENSE.
 */

import { getCollection } from 'astro:content';
import { describe, expect, it, vi } from 'vitest';
import ReadingPage from '../../../../src/pages/reading/index.astro';
import site from '../../../../src/data/site.json';
import { dom, normalize, render } from '../../../support/container';
import { book, collectionStub } from '../../../support/content';
import { stubRemoteImages } from '../../../support/images';

vi.mock('astro:content', async (importOriginal) => ({
  ...(await importOriginal<typeof import('astro:content')>()),
  getCollection: vi.fn(),
}));

const cover = (id: string) => `https://i.gr-assets.com/images/S/compressed.photo.goodreads.com/books/${id}.jpg`;

const books = [
  book('now', { shelf: 'currently-reading', title: 'In Hand', subtitle: 'A Subtitle', cover: cover('now') }),
  book('fav-b', { shelf: 'favorites', position: 1, title: 'Second Favorite', cover: cover('fav-b') }),
  book('fav-a', { shelf: 'favorites', position: 0, title: 'First Favorite' }),
  book('old', { readAt: new Date('2024-05-01'), rating: 3 }),
  book('new', { readAt: new Date('2026-05-01'), rating: 5 }),
  book('undated', { readAt: null, addedAt: new Date('2026-09-01') }),
  book('next-old', { toRead: true, addedAt: new Date('2025-01-01') }),
  book('next-new', { toRead: true, addedAt: new Date('2026-02-01') }),
];

async function renderPage(entries = books) {
  stubRemoteImages();
  vi.mocked(getCollection).mockImplementation(collectionStub({ books: entries }) as typeof getCollection);
  return dom(await render(ReadingPage, { path: '/reading/' }));
}

describe('reading page', () => {
  it('opens with the hero, linking the Goodreads profile', async () => {
    // Arrange (fixture books)

    // Act
    const root = await renderPage();

    // Assert
    expect(root.querySelector('title')!.text).toBe('Reading · Jimmy Kurian');
    expect(normalize(root.querySelector('h1')!.innerHTML)).toBe("What I'm <em>reading</em>.");
    expect(root.querySelector('.page-hero__rss')!.getAttribute('href')).toBe(site.links.goodreads);
    expect(root.querySelector('.page-hero__intro a')!.text).toBe('See the full list on Goodreads');
    expect(root.querySelector('.nav__link[aria-current="page"]')!.getAttribute('href')).toBe('/reading/');
  });

  it('shows the books in hand with cover, subtitle and author', async () => {
    // Arrange (fixture books)

    // Act
    const root = await renderPage();

    // Assert
    const item = root.querySelector('#current .shelf__book')!;
    expect(item.querySelector('.list-title')!.text.trim()).toBe('In Hand');
    expect(item.querySelector('.shelf__subtitle')!.text).toBe('A Subtitle');
    expect(item.querySelector('img.shelf__cover')!.getAttribute('loading')).toBe('eager');
  });

  it('shows favorites in shelf order, with a blank tile when a cover is missing', async () => {
    // Arrange (fixture books)

    // Act
    const root = await renderPage();

    // Assert
    const favorites = root.querySelectorAll('#favorites .covers__book');
    expect(favorites.map((f) => f.querySelector('.covers__title')!.text)).toEqual([
      'First Favorite',
      'Second Favorite',
    ]);
    expect(favorites[0].querySelector('.covers__img--blank')).not.toBeNull();
    expect(favorites[1].querySelector('img.covers__img')).not.toBeNull();
    expect(root.querySelector('#favorites .ledger__label .note')!.text).toBe('2 books');
  });

  it('lists the engineering shelf read first, newest first, then what is to read', async () => {
    // Arrange (fixture books)

    // Act
    const root = await renderPage();

    // Assert
    const titles = root.querySelectorAll('#software-engineering .book__title').map((a) => a.text.trim());
    expect(titles).toEqual(['Book new', 'Book old', 'Book undated', 'Book next-new', 'Book next-old']);
    expect(root.querySelectorAll('#software-engineering .book__group').map((g) => g.text)).toEqual(['Read', 'To read']);
    expect(root.querySelector('#software-engineering .ledger__label .note')!.text).toBe('5 books, read and on deck');
  });

  it('downloads covers at build time instead of hot-linking Goodreads', async () => {
    // Arrange (fixture books)

    // Act
    const root = await renderPage();

    // Assert
    const sources = root.querySelectorAll('img').map((img) => img.getAttribute('src')!);
    expect(sources.length).toBeGreaterThan(0);
    expect(sources.every((src) => /^\/_image\/?\?href=https%3A%2F%2Fi\.gr-assets\.com/.test(src))).toBe(true);
    expect(sources.every((src) => src.includes('f=webp'))).toBe(true);
  });

  it('leaves out shelves that are empty', async () => {
    // Arrange
    const onlyFavorites = books.filter((b) => b.data.shelf === 'favorites');

    // Act
    const root = await renderPage(onlyFavorites);

    // Assert
    expect(root.querySelector('#current')).toBeNull();
    expect(root.querySelector('#software-engineering')).toBeNull();
    expect(root.querySelector('#favorites')).not.toBeNull();
  });
});
