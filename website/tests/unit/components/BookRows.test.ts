/**
 * @file BookRows.test.ts
 * @author Jimmy Kurian
 * @copyright Copyright (c) 2026 Jimmy Kurian. All rights reserved. See LICENSE.
 */

import { describe, expect, it } from 'vitest';
import BookRows from '../../../src/components/BookRows.astro';
import { book } from '../../support/content';
import { dom, normalize, render } from '../../support/container';

const books = (prefix: string, n: number, rating = 0) =>
  Array.from({ length: n }, (_, i) => book(`${prefix}${i}`, { rating }));

describe('BookRows', () => {
  it('labels the first row of each group with its name and count', async () => {
    // Arrange
    const props = {
      groups: [
        ['Read', books('r', 2, 4)],
        ['To read', books('t', 1)],
      ],
    };

    // Act
    const html = await render(BookRows, { props });

    // Assert
    const rows = dom(html).querySelectorAll('li.book');
    expect(rows).toHaveLength(3);
    expect(rows.map((r) => r.querySelector('.row__date')!.text.trim())).toEqual(['Read2 books', '', 'To read1 book']);
    expect(normalize(html)).toMatchSnapshot();
  });

  it('links each title to Goodreads and shows the author', async () => {
    // Arrange
    const props = { groups: [['Read', [book('42', { title: 'Accelerate', author: 'Nicole Forsgren' })]]] };

    // Act
    const html = await render(BookRows, { props });

    // Assert
    const row = dom(html).querySelector('li.book')!;
    expect(row.querySelector('.book__title')!.getAttribute('href')).toBe('https://www.goodreads.com/book/show/42');
    expect(row.querySelector('.book__title')!.text.trim()).toBe('Accelerate');
    expect(row.querySelector('.row__body .note')!.text).toBe('Nicole Forsgren');
  });

  it.each([1, 3, 5])('shows %i of 5 stars with a spoken label', async (rating) => {
    // Arrange
    const props = { groups: [['Read', [book('1', { rating })]]] };

    // Act
    const html = await render(BookRows, { props });

    // Assert
    const stars = dom(html).querySelector('.stars')!;
    // An aria-label is only announced on an element with a role.
    expect(stars.getAttribute('role')).toBe('img');
    expect(stars.getAttribute('aria-label')).toBe(`Rated ${rating} of 5`);
    expect(stars.querySelector('.stars__empty')!.text).toBe('★'.repeat(5 - rating));
    expect(stars.text.length).toBe(5);
  });

  it('shows no stars for an unrated book', async () => {
    // Arrange
    const props = { groups: [['To read', [book('1', { rating: 0 })]]] };

    // Act
    const html = await render(BookRows, { props });

    // Assert
    expect(dom(html).querySelector('.stars')).toBeNull();
  });

  it.each([
    [10, false],
    [11, true],
  ])('with %i books in all, renders the hidden Show more control: %s', async (n, expected) => {
    // Arrange
    const props = {
      groups: [
        ['Read', books('r', n - 1)],
        ['To read', books('t', 1)],
      ],
    };

    // Act
    const html = await render(BookRows, { props });

    // Assert
    const more = dom(html).querySelector('p.more');
    expect(Boolean(more)).toBe(expected);
    if (more) expect(more.hasAttribute('hidden')).toBe(true);
  });
});
