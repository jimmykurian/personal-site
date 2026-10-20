import { expect, routes, test } from './fixtures';

test.describe('every page', () => {
  for (const route of routes) {
    test(`${route} loads cleanly, without errors or horizontal scroll`, async ({ page, problems }) => {
      // Arrange
      const response = await page.goto(route);

      // Act
      await page.evaluate(async () => {
        // Scroll through so lazy images load, then return to the top.
        for (let y = 0; y < document.body.scrollHeight; y += innerHeight) {
          scrollTo(0, y);
          await new Promise((r) => setTimeout(r, 50));
        }
        scrollTo(0, 0);
      });
      await page.waitForLoadState('networkidle');
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - innerWidth);

      // Assert
      expect(response?.status()).toBe(200);
      await expect(page.locator('h1')).toHaveCount(1);
      expect(overflow).toBeLessThanOrEqual(0);
      expect(problems).toEqual([]);
    });

    test(`${route} shows every image`, async ({ page }) => {
      // Arrange
      await page.goto(route);
      const images = page.locator('main img');

      // Act
      for (const img of await images.all()) await img.scrollIntoViewIfNeeded();
      // Lazy images start loading when scrolled to; give them time to finish.
      await page
        .waitForFunction(
          () => [...document.querySelectorAll<HTMLImageElement>('main img')].every((img) => img.complete),
          null,
          { timeout: 10_000 },
        )
        .catch(() => {});
      const broken = await images.evaluateAll((els) =>
        // An SVG without intrinsic size reports naturalWidth 0, so also accept a rendered size.
        (els as HTMLImageElement[])
          .filter((img) => !img.complete || (img.naturalWidth === 0 && img.getBoundingClientRect().width === 0))
          .map((img) => img.src),
      );

      // Assert
      expect(broken).toEqual([]);
    });
  }
});

test.describe('missing pages', () => {
  test('answer with the 404 page and a way back', async ({ page }) => {
    // Arrange
    const url = '/no-such-page/';

    // Act
    const response = await page.goto(url);

    // Assert
    expect(response?.status()).toBe(404);
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Nothing here.');
    await page.getByRole('link', { name: 'home page' }).click();
    await expect(page).toHaveURL('/');
  });
});

test.describe('downloads and feeds', () => {
  test('the resume button serves the PDF', async ({ page, request }) => {
    // Arrange
    await page.goto('/');
    const href = await page.getByRole('link', { name: 'Download PDF' }).getAttribute('href');

    // Act
    const response = await request.get(href!);

    // Assert
    expect(href).toBe('/resume.pdf');
    expect(response.status()).toBe(200);
    expect(response.headers()['content-type']).toContain('application/pdf');
    expect((await response.body()).subarray(0, 5).toString()).toBe('%PDF-');
  });

  test('the footer RSS link serves the feed', async ({ page, request }) => {
    // Arrange
    await page.goto('/');
    const href = await page.locator('footer').getByRole('link', { name: 'RSS' }).getAttribute('href');

    // Act
    const response = await request.get(href!);

    // Assert
    expect(response.status()).toBe(200);
    expect(await response.text()).toContain('<rss');
  });
});
