/**
 * @file observability.spec.ts
 * @author Jimmy Kurian
 * @copyright Copyright (c) 2026 Jimmy Kurian. All rights reserved. See LICENSE.
 */

import { expect, test } from './fixtures';

// Only a build with the observability settings (main in CI) has the tools; on other builds
// these tests are skipped. The fixture answers every request to the tools' hosts.

/** A PostHog request body: JSON, or with sendBeacon, `data=` and base64-encoded JSON. */
const decode = (body: string) =>
  body.startsWith('data=') ? Buffer.from(decodeURIComponent(body.slice(5)), 'base64').toString('utf8') : body;
test.describe('observability', () => {
  test.beforeEach(async ({ page }) => {
    // PostHog drops events from automated browsers (navigator.webdriver), which keeps CI
    // out of the data. These tests pretend to be a real browser to check the events.
    await page.addInitScript(() => Object.defineProperty(navigator, 'webdriver', { get: () => false }));
    await page.goto('/');
    const enabled = await page.locator('script[src^="https://static.cloudflareinsights.com/"]').count();
    test.skip(enabled === 0, 'this build has no observability settings');
  });

  test('sets no cookies and stores nothing in the browser', async ({ page, context, observability }) => {
    // Arrange (the home page, loaded above)

    // Act (PostHog starts once the browser is idle)
    await expect
      .poll(() => observability.some((r) => r.url().startsWith('https://static.cloudflareinsights.com/')))
      .toBe(true);
    await page.waitForTimeout(5_000);

    // Assert
    expect(await context.cookies()).toEqual([]);
    expect(await page.evaluate(() => localStorage.length + sessionStorage.length)).toBe(0);
  });

  test('sends an event to PostHog when the resume PDF link is followed', async ({ page, observability }) => {
    // Arrange (PostHog starts once the browser is idle)
    await page.waitForTimeout(5_000);
    const sent = () =>
      observability
        .filter((r) => r.url().startsWith('https://us.i.posthog.com/'))
        .map((r) => decode(r.postData() ?? ''))
        .join('\n');

    // Act (Chrome opens the PDF in its viewer; the event goes with sendBeacon as the page leaves)
    await page.locator('a[data-track="resume_pdf_download"]').click();

    // Assert
    await expect.poll(sent).toContain('resume_pdf_download');
    expect(sent()).not.toMatch(/"\$pageview"|"\$autocapture"/);
  });
});
