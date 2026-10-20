import { defineConfig, devices } from '@playwright/test';

// End-to-end tests drive the built site in Chrome, at desktop and phone sizes. They serve
// dist/ with `astro preview`, so run `pnpm build` (and `pnpm resume`) first. Set
// E2E_BASE_URL to test a deployed site instead, e.g. https://www.jimmykurian.me.
const baseURL = process.env.E2E_BASE_URL ?? 'http://127.0.0.1:4329';

export default defineConfig({
  testDir: 'tests/e2e',
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [['github'], ['list']] : 'list',
  use: {
    baseURL,
    // The installed Google Chrome, so no browser download is needed (GitHub's runners have it).
    channel: 'chrome',
    trace: 'retain-on-failure',
  },
  projects: [
    {
      name: 'desktop',
      use: { ...devices['Desktop Chrome'], channel: 'chrome', viewport: { width: 1280, height: 800 } },
    },
    { name: 'phone', use: { ...devices['Pixel 7'], channel: 'chrome' } },
  ],
  webServer: process.env.E2E_BASE_URL
    ? undefined
    : {
        command: 'pnpm exec astro preview --port 4329 --host 127.0.0.1 --ignore-lock',
        url: baseURL,
        reuseExistingServer: !process.env.CI,
        timeout: 60_000,
      },
});
