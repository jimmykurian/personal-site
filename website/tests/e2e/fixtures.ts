/**
 * @file fixtures.ts
 * @author Jimmy Kurian
 * @copyright Copyright (c) 2026 Jimmy Kurian. All rights reserved. See LICENSE.
 */

import { test as base, expect, type Page, type Request } from '@playwright/test';

/** The routes every visitor can reach, used for checks that apply to all pages. */
export const routes = [
  '/',
  '/writing/',
  '/reading/',
  '/writing/clean-architecture-ddd-cqrs-mediator-dotnet-chatbot/',
  '/privacy/',
];

export const isPhone = (page: Page) => (page.viewportSize()?.width ?? 1280) < 860;

/**
 * The observability hosts (docs/observability.md). On a build that includes the tools (main
 * in CI), the tests answer these requests themselves, so nothing reaches Cloudflare, Sentry
 * or PostHog from CI.
 */
const observabilityHosts = [
  { url: 'https://static.cloudflareinsights.com/**', contentType: 'text/javascript', body: '' },
  { url: 'https://cloudflareinsights.com/**', contentType: 'application/json', body: '{}' },
  { url: /^https:\/\/[^/]+\.ingest\.us\.sentry\.io\//, contentType: 'application/json', body: '{}' },
  { url: 'https://us.i.posthog.com/**', contentType: 'application/json', body: '{"status":1}' },
];

/**
 * Fails a test on any console error or uncaught exception, and on failed requests to the
 * site itself (third-party links are not followed by the page, so none should be loaded).
 * `observability` records the requests the page made to the observability hosts.
 */
export const test = base.extend<{ problems: string[]; observability: Request[] }>({
  observability: [
    async ({ page }, use) => {
      const requests: Request[] = [];
      for (const { url, contentType, body } of observabilityHosts) {
        await page.route(url, (route) => {
          requests.push(route.request());
          return route.fulfill({ status: 200, contentType, body });
        });
      }
      await use(requests);
    },
    { auto: true },
  ],
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
