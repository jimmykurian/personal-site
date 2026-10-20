/**
 * @file setup.ts
 * @author Jimmy Kurian
 * @copyright Copyright (c) 2026 Jimmy Kurian. All rights reserved. See LICENSE.
 */

import { execFile } from 'node:child_process';
import { mkdtemp, rm } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { promisify } from 'node:util';
import type { TestProject } from 'vitest/node';

declare module 'vitest' {
  export interface ProvidedContext {
    /** Directory holding the built site as `dist/`, the layout scripts/resume-pdf.mjs expects. */
    buildRoot: string;
  }
}

// Builds the production site once for every integration test, the way CI does: real
// content, the live Goodreads shelves and downloaded fonts. Set INTEGRATION_DIST to the
// parent of an existing dist/ (e.g. `.` after `pnpm build`) to test that build instead.
export default async function setup(project: TestProject) {
  if (process.env.INTEGRATION_DIST) {
    project.provide('buildRoot', resolve(process.env.INTEGRATION_DIST));
    return;
  }

  const root = await mkdtemp(join(tmpdir(), 'jimmykurian-build-'));
  const astro = join(dirname(createRequire(import.meta.url).resolve('astro/package.json')), 'bin', 'astro.mjs');
  await promisify(execFile)(process.execPath, [astro, 'build', '--outDir', join(root, 'dist')], {
    cwd: resolve(import.meta.dirname, '../..'),
    env: { ...process.env, NODE_ENV: 'production' },
    maxBuffer: 64 * 1024 * 1024,
  });
  project.provide('buildRoot', root);

  return () => rm(root, { recursive: true, force: true });
}
