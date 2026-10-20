import { expect, test } from './fixtures';

test.describe('writing', () => {
  test('the archive nav jumps to a year and month', async ({ page }) => {
    // Arrange
    await page.goto('/writing/');
    const archive = page.getByRole('navigation', { name: 'Posts by date' });
    const month = archive.getByRole('link').nth(1);
    const target = (await month.getAttribute('href'))!;

    // Act
    await month.click();

    // Assert
    await expect(page).toHaveURL(new RegExp(`${target}$`));
    // Month ids such as 2026-10 start with a digit, which a #id selector can't express.
    await expect(page.locator(`[id="${target.slice(1)}"]`)).toBeInViewport();
  });

  test('a post opens from the list and links back to it', async ({ page }) => {
    // Arrange
    await page.goto('/writing/');
    const first = page.locator('#posts .post__title').first();
    const title = (await first.innerText()).replace(/\s*Draft$/, '').trim();

    // Act
    await first.click();

    // Assert
    await expect(page).toHaveURL(/\/writing\/[^/]+\/$/);
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(title);
    await expect(page.getByText(/\d+ min read/)).toBeVisible();
    await page.locator('.post__back').click();
    await expect(page).toHaveURL('/writing/');
  });

  test('the post lists its date and tags, then the body', async ({ page }) => {
    // Arrange
    await page.goto('/writing/clean-architecture-ddd-cqrs-mediator-dotnet-chatbot/');

    // Act
    const meta = page.locator('.post__meta');

    // Assert
    await expect(meta.locator('time').first()).toHaveText('October 17, 2026');
    await expect(meta.locator('.post__tags span').first()).toBeVisible();
    await expect(page.locator('.prose h2').first()).toBeVisible();
  });
});
