/**
 * @file fixtures.ts
 * @author Jimmy Kurian
 * @copyright Copyright (c) 2026 Jimmy Kurian. All rights reserved. See LICENSE.
 */

import { test as base, expect, type Page } from '@playwright/test';

/** The routes every visitor can reach, used for checks that apply to all pages. */
export const routes = ['/', '/writing/', '/reading/', '/writing/clean-architecture-ddd-cqrs-mediator-dotnet-chatbot/'];

export const isPhone = (page: Page) => (page.viewportSize()?.width ?? 1280) < 860;

/**
 * Fails a test on any console error or uncaught exception, and on failed requests to the
 * site itself (third-party links are not followed by the page, so none should be loaded).
 */
export const test = base.extend<{ problems: string[] }>({
  problems: [
    async ({ page, baseURL }, use) => {
      const problems: string[] = [];
      page.on('console', (msg) => msg.type() === 'error' && problems.push(`console: ${msg.text()}`));
      page.on('pageerror', (err) => problems.push(`exception: ${err.message}`));
      page.on('requestfailed', (req) => problems.push(`request failed: ${req.url()}`));
      page.on('response', (res) => {
        const own = res.url().startsWith(baseURL!);
        const expected404 = res.request().isNavigationRequest() && res.status() === 404;
        if (own && res.status() >= 400 && !expected404) problems.push(`${res.status()}: ${res.url()}`);
      });
      await use(problems);
    },
    { auto: true },
  ],
});

export { expect };
