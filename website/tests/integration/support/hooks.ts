/**
 * @file hooks.ts
 * @author Jimmy Kurian
 * @copyright Copyright (c) 2026 Jimmy Kurian. All rights reserved. See LICENSE.
 */

import { AfterAll, Before, BeforeAll, setDefaultTimeout } from '@cucumber/cucumber';
import { execFile } from 'node:child_process';
import { existsSync } from 'node:fs';
import { mkdtemp, rm } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { promisify } from 'node:util';
import { setBuildRoot } from '../../support/dist';

setDefaultTimeout(60_000);

const temporary: string[] = [];

/** Makes a temporary folder that's removed after the run. */
export async function tempDir(prefix: string): Promise<string> {
  const dir = await mkdtemp(join(tmpdir(), prefix));
  temporary.push(dir);
  return dir;
}

/** The installed Chrome or Chromium, if any. */
export const chrome = [
  process.env.CHROME_PATH,
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  '/usr/bin/google-chrome',
  '/usr/bin/google-chrome-stable',
  '/usr/bin/chromium',
  '/usr/bin/chromium-browser',
].find((p) => p && existsSync(p));

// Builds the production site once for every scenario, the way CI does: real content, the live
// Goodreads shelves and downloaded fonts. Set INTEGRATION_DIST to the parent of an existing
// dist/ (e.g. `.` after `pnpm build`) to test that build instead.
BeforeAll({ timeout: 300_000 }, async function () {
  if (process.env.INTEGRATION_DIST) {
    setBuildRoot(resolve(process.env.INTEGRATION_DIST));
    return;
  }

  const root = await tempDir('jimmykurian-build-');
  const astro = join(dirname(createRequire(import.meta.url).resolve('astro/package.json')), 'bin', 'astro.mjs');
  await promisify(execFile)(process.execPath, [astro, 'build', '--outDir', join(root, 'dist')], {
    cwd: resolve(import.meta.dirname, '../../..'),
    env: { ...process.env, NODE_ENV: 'production' },
    maxBuffer: 64 * 1024 * 1024,
  });
  setBuildRoot(root);
});

// Scenarios tagged @chrome need a local Chrome, and are skipped without one.
Before({ tags: '@chrome' }, function () {
  return chrome ? undefined : 'skipped';
});

AfterAll(async function () {
  await Promise.all(temporary.map((dir) => rm(dir, { recursive: true, force: true })));
});
