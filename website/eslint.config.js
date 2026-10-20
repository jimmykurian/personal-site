/**
 * @file eslint.config.js
 * @author Jimmy Kurian
 * @copyright Copyright (c) 2026 Jimmy Kurian. All rights reserved. See LICENSE.
 */

import js from '@eslint/js';
import astro from 'eslint-plugin-astro';
import globals from 'globals';
import tsdoc from 'eslint-plugin-tsdoc';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  {
    ignores: [
      'dist/',
      '.astro/',
      'coverage/',
      'test-results/',
      'playwright-report/',
      '.lighthouseci/',
      'private/',
      'docs/',
    ],
  },
  js.configs.recommended,
  tseslint.configs.recommended,
  astro.configs.recommended,
  // Accessibility rules for the markup in .astro files (eslint-plugin-jsx-a11y-x supports ESLint 10).
  astro.configs['jsx-a11y-recommended'],
  {
    languageOptions: { globals: { ...globals.browser, ...globals.node } },
  },
  {
    // TypeScript (astro check) already reports undefined names, and knows Astro's global types.
    files: ['**/*.ts', '**/*.astro'],
    rules: { 'no-undef': 'off' },
  },
  {
    // Doc comments in src/ are TSDoc (tsdoc.json extends TypeDoc's tags); TypeDoc builds docs/ from them.
    files: ['src/**/*.ts'],
    plugins: { tsdoc },
    rules: { 'tsdoc/syntax': 'error' },
  },
);
