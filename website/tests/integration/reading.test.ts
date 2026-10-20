/**
 * @file reading.test.ts
 * @author Jimmy Kurian
 * @copyright Copyright (c) 2026 Jimmy Kurian. All rights reserved. See LICENSE.
 */

import { describe, expect, it } from 'vitest';
import { page } from '../support/dist';

// Built from the live Goodreads feeds, so these check shape rather than specific books.
describe('reading page from the live Goodreads shelves', () => {
  it('fills the favorites and software-engineering shelves', () => {
    // Arrange
    const root = page('/reading/index.html');

    // Act
    const favorites = root.querySelectorAll('#favorites .covers__book').length;
    const engineering = root.querySelectorAll('#software-engineering li.book').length;

    // Assert
    expect(favorites).toBeGreaterThan(0);
    expect(engineering).toBeGreaterThan(0);
  });

  it('links every book to its Goodreads page', () => {
    // Arrange
    const root = page('/reading/index.html');

    // Act
    const hrefs = root
      .querySelectorAll('.book__title, .covers__link, #current .list-title')
      .map((a) => a.getAttribute('href')!);

    // Assert
    expect(hrefs.length).toBeGreaterThan(0);
    expect(hrefs.every((href) => /^https:\/\/www\.goodreads\.com\/book\/show\/\d+$/.test(href))).toBe(true);
  });

  it('pages a long shelf ten at a time, with every book in the HTML for readers without JavaScript', () => {
    // Arrange
    const root = page('/reading/index.html');
    const list = root.querySelector('#software-engineering [data-paged]')!;

    // Act
    const rows = list.querySelectorAll('li.book').length;
    const more = root.querySelector('#software-engineering .more');

    // Assert
    expect(rows > 10).toBe(Boolean(more));
    expect(list.querySelectorAll('li[hidden]')).toHaveLength(0);
  });

  it('ships the paging script', () => {
    // Arrange
    const root = page('/reading/index.html');

    // Act
    const scripts = root.querySelectorAll('script[type="module"]');

    // Assert
    expect(scripts.length).toBeGreaterThan(0);
  });
});
