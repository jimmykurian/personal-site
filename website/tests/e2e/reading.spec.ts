/**
 * @file reading.spec.ts
 * @author Jimmy Kurian
 * @copyright Copyright (c) 2026 Jimmy Kurian. All rights reserved. See LICENSE.
 */

import { expect, test } from './fixtures';

const shelf = (page: import('@playwright/test').Page) => page.locator('#software-engineering');

test.describe('reading list paging', () => {
  test('shows ten books, then ten more per click, until all are shown', async ({ page }) => {
    // Arrange
    await page.goto('/reading/');
    const rows = shelf(page).locator('li.book');
    const total = await rows.count();
    test.skip(total <= 10, 'the shelf is too short to page');
    const button = shelf(page).getByRole('button', { name: /^Show \d+ more$/ });
    const status = shelf(page).locator('.more__count');

    // Act
    await expect(shelf(page).locator('li.book:visible')).toHaveCount(10);
    await expect(status).toHaveText(`10 of ${total}`);
    await button.click();

    // Assert
    await expect(shelf(page).locator('li.book:visible')).toHaveCount(Math.min(20, total));
    await expect(status).toHaveText(`${Math.min(20, total)} of ${total}`);
    await expect(rows.nth(10).locator('a')).toBeFocused();
    for (let shown = 20; shown < total; shown += 10) await button.click();
    await expect(shelf(page).locator('li.book:visible')).toHaveCount(total);
    await expect(shelf(page).locator('.more')).toBeHidden();
  });

  test('names how many books the next click adds', async ({ page }) => {
    // Arrange
    await page.goto('/reading/');
    const total = await shelf(page).locator('li.book').count();
    test.skip(total <= 10, 'the shelf is too short to page');

    // Act
    const label = await shelf(page).locator('.more button').textContent();

    // Assert
    expect(label).toBe(`Show ${Math.min(10, total - 10)} more`);
  });
});

test.describe('reading list without JavaScript', () => {
  test.use({ javaScriptEnabled: false });

  test('lists every book and hides the Show more control', async ({ page }) => {
    // Arrange
    await page.goto('/reading/');

    // Act
    const total = await shelf(page).locator('li.book').count();

    // Assert
    await expect(shelf(page).locator('li.book:visible')).toHaveCount(total);
    await expect(shelf(page).locator('.more')).toBeHidden();
  });
});

test.describe('reading list covers', () => {
  test('favorites link each cover to Goodreads', async ({ page }) => {
    // Arrange
    await page.goto('/reading/');

    // Act
    const hrefs = await page
      .locator('#favorites .covers__link')
      .evaluateAll((els) => els.map((a) => a.getAttribute('href')));

    // Assert
    expect(hrefs.length).toBeGreaterThan(0);
    for (const href of hrefs) expect(href).toMatch(/^https:\/\/www\.goodreads\.com\/book\/show\/\d+$/);
  });
});
