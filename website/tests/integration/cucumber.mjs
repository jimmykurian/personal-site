/**
 * @file cucumber.mjs
 * @author Jimmy Kurian
 * @copyright Copyright (c) 2026 Jimmy Kurian. All rights reserved. See LICENSE.
 */

// The integration suite: Gherkin features in features/, step definitions in steps/. The
// hooks build the site once (or use INTEGRATION_DIST), then every scenario checks dist/.
export default {
  paths: ['tests/integration/features/**/*.feature'],
  // register.mjs first, so the TypeScript after it can load.
  import: [
    'tests/integration/support/register.mjs',
    'tests/integration/support/world.ts',
    'tests/integration/support/hooks.ts',
    'tests/integration/steps/**/*.ts',
  ],
  // The progress dots and failures for the log; the JSON report feeds CI's check table.
  format: ['progress', 'json:reports/integration.json'],
  // Fail on undefined or pending steps rather than skipping them.
  strict: true,
};
