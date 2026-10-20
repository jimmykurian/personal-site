import site from '../../src/data/site.json' with { type: 'json' };
import { expect, test } from './fixtures';

test.describe('home page headline', () => {
  test('types through the rotating phrases', async ({ page }) => {
    // Arrange
    await page.goto('/');
    const typed = page.locator('h1 .typed');
    await expect(typed).toHaveText(site.headline.rotating[0]);

    // Act (the first phrase holds for about three seconds, then the next is typed out)

    // Assert
    await expect(typed).toHaveText(site.headline.rotating[1], { timeout: 15_000 });
  });

  test('keeps the headline from changing height while it types', async ({ page }) => {
    // Arrange
    await page.goto('/');
    const title = page.locator('h1');
    await page.evaluate(() => document.fonts.ready);
    const before = await title.boundingBox();

    // Act
    await expect(page.locator('h1 .typed')).toHaveText(site.headline.rotating[1], { timeout: 15_000 });
    const after = await title.boundingBox();

    // Assert
    expect(after!.height).toBe(before!.height);
  });

  test('stays still for visitors who prefer reduced motion', async ({ page }) => {
    // Arrange
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/');

    // Act
    await page.waitForTimeout(4_500);

    // Assert
    await expect(page.locator('h1 .typed')).toHaveText(site.headline.emphasis);
  });

  test('reads as one sentence to screen readers', async ({ page }) => {
    // Arrange
    await page.goto('/');

    // Act
    const name = await page.getByRole('heading', { level: 1 }).evaluate((h) => h.textContent!.replace(/\s+/g, ' '));

    // Assert
    // Chrome joins the hidden phrase and the full stop with a space; either reads the same.
    const escaped = `${site.headline.lead} ${site.headline.emphasis}`.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    await expect(page.getByRole('heading', { level: 1 })).toHaveAccessibleName(new RegExp(`^${escaped} ?\\.$`));
    expect(name).toContain(`${site.headline.lead} ${site.headline.emphasis}`);
  });
});

test.describe('home page links', () => {
  test('the hero icons reach LinkedIn, GitHub, Stack Overflow and email', async ({ page }) => {
    // Arrange
    await page.goto('/');
    const social = page.locator('.hero__social');

    // Act
    const links = await social
      .getByRole('link')
      .evaluateAll((els) => els.map((a) => [a.getAttribute('aria-label'), a.getAttribute('href')]));

    // Assert
    expect(links).toEqual([
      ['LinkedIn', site.links.linkedin],
      ['GitHub', site.links.github],
      ['Stack Overflow', site.links.stackoverflow],
      [`Email ${site.email}`, `mailto:${site.email}`],
    ]);
  });

  test('the Projects button scrolls to the projects', async ({ page }) => {
    // Arrange
    await page.goto('/');

    // Act
    await page.locator('.hero__cta').click();

    // Assert
    await expect(page).toHaveURL(/#projects$/);
    await expect(page.locator('#projects')).toBeInViewport();
  });

  test('the contact button writes to hello@', async ({ page }) => {
    // Arrange
    await page.goto('/#contact');

    // Act
    const email = page.locator('.contact__email');

    // Assert
    await expect(email).toBeInViewport();
    await expect(email).toHaveAttribute('href', 'mailto:hello@jimmykurian.me');
  });
});
