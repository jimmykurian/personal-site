/**
 * @file navigation.spec.ts
 * @author Jimmy Kurian
 * @copyright Copyright (c) 2026 Jimmy Kurian. All rights reserved. See LICENSE.
 */

import { expect, isPhone, test } from './fixtures';

test.describe('skip link', () => {
  test('is the first stop for keyboard users and jumps to the content', async ({ page }) => {
    // Arrange
    await page.goto('/writing/');

    // Act
    await page.keyboard.press('Tab');
    const skip = page.getByRole('link', { name: 'Skip to content' });
    await expect(skip).toBeFocused();
    await expect(skip).toBeInViewport();
    await page.keyboard.press('Enter');

    // Assert
    await expect(page).toHaveURL(/#main$/);
  });
});

test.describe('desktop navigation', () => {
  test.skip(({ page }) => isPhone(page), 'the wide nav is hidden on phones');

  test('reaches the pages and home sections, marking the current page', async ({ page }) => {
    // Arrange
    await page.goto('/');
    const nav = page.getByRole('navigation', { name: 'Primary' }).first();

    // Act
    await nav.getByRole('link', { name: 'Reading' }).click();
    await expect(page).toHaveURL('/reading/');
    await page.getByRole('navigation', { name: 'Primary' }).first().getByRole('link', { name: 'Teaching' }).click();

    // Assert
    await expect(page).toHaveURL('/#teaching');
    await expect(page.locator('#teaching')).toBeInViewport();
  });

  test('marks the current page', async ({ page }) => {
    // Arrange
    await page.goto('/writing/');

    // Act
    const current = page.getByRole('navigation', { name: 'Primary' }).first().locator('[aria-current="page"]');

    // Assert
    await expect(current).toHaveText('Writing');
  });

  test('the phone menu stays hidden', async ({ page }) => {
    // Arrange
    await page.goto('/');

    // Act
    const toggle = page.locator('.menu__toggle');

    // Assert
    await expect(toggle).toBeHidden();
  });
});

test.describe('phone menu', () => {
  test.skip(({ page }) => !isPhone(page), 'the menu only shows on narrow screens');

  test('opens, lists every section, and closes after following a link', async ({ page }) => {
    // Arrange
    await page.goto('/');
    const menu = page.locator('details.menu');
    await expect(page.locator('.nav--wide')).toBeHidden();

    // Act
    await page.getByText('Menu', { exact: true }).click();
    await expect(menu).toHaveAttribute('open', '');
    const links = await menu.locator('.menu__link').allTextContents();
    await menu.getByRole('link', { name: 'Projects' }).click();

    // Assert
    expect(links.map((l) => l.trim())).toEqual([
      'Experience',
      'Service',
      'Projects',
      'Writing',
      'Reading',
      'Teaching',
      'Contact',
      'Resume',
    ]);
    await expect(page).toHaveURL('/#projects');
    await expect(menu).not.toHaveAttribute('open');
    await expect(page.locator('#projects')).toBeInViewport();
  });

  test('closes again with the Close toggle', async ({ page }) => {
    // Arrange
    await page.goto('/writing/');
    await page.getByText('Menu', { exact: true }).click();

    // Act
    await page.getByText('Close', { exact: true }).click();

    // Assert
    await expect(page.locator('details.menu')).not.toHaveAttribute('open');
    await expect(page.locator('.menu__panel')).toBeHidden();
  });
});
