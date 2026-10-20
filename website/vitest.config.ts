/**
 * @file vitest.config.ts
 * @author Jimmy Kurian
 * @copyright Copyright (c) 2026 Jimmy Kurian. All rights reserved. See LICENSE.
 */

/// <reference types="vitest/config" />
import { getViteConfig } from 'astro/config';

// getViteConfig loads astro.config.mjs, so tests resolve .astro files, astro:content and
// astro:assets the same way the build does.
export default getViteConfig({
  test: {
    restoreMocks: true,
    unstubEnvs: true,
    unstubGlobals: true,
    // Used by `pnpm test:coverage` (unit tests). The thresholds are the coverage when they were
    // added, so it can only go up.
    coverage: {
      provider: 'v8',
      include: ['src/**/*.{ts,astro}'],
      reporter: ['text-summary', 'json-summary'],
      thresholds: { statements: 100, branches: 96, functions: 100, lines: 100 },
    },
    projects: [
      {
        extends: true,
        test: { name: 'unit', include: ['tests/unit/**/*.test.ts'] },
      },
      {
        // Builds the whole site once, then checks the output (see tests/integration/setup.ts).
        extends: true,
        test: {
          name: 'integration',
          include: ['tests/integration/**/*.test.ts'],
          globalSetup: ['tests/integration/setup.ts'],
          hookTimeout: 300_000,
          testTimeout: 60_000,
        },
      },
    ],
  },
});
