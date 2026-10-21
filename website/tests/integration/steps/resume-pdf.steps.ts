/**
 * @file resume-pdf.steps.ts
 * @author Jimmy Kurian
 * @copyright Copyright (c) 2026 Jimmy Kurian. All rights reserved. See LICENSE.
 */

import { Then, When } from '@cucumber/cucumber';
import { execFile } from 'node:child_process';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { promisify } from 'node:util';
import { buildRoot } from '../../support/dist';
import { tempDir } from '../support/hooks';
import type { SiteWorld } from '../support/world';

const script = resolve(import.meta.dirname, '../../../scripts/resume-pdf.mjs');

When('I print the resume with scripts\\/resume-pdf.mjs', async function (this: SiteWorld) {
  const pdf = join(await tempDir('resume-pdf-'), 'resume.pdf');
  const { stdout } = await promisify(execFile)(process.execPath, [script, pdf], { cwd: buildRoot() });
  this.remember('pdf', pdf);
  this.remember('stdout', stdout);
});

Then('the script reports the file it wrote', function (this: SiteWorld) {
  assert.ok(this.recall<string>('stdout').includes(`resume-pdf: wrote ${this.recall<string>('pdf')}`));
});

Then('the file is a PDF of at least {int} KB with at least one page', function (this: SiteWorld, kb: number) {
  const bytes = readFileSync(this.recall<string>('pdf'));
  assert.equal(bytes.subarray(0, 5).toString(), '%PDF-');
  assert.ok(bytes.length > kb * 1000, `${bytes.length} bytes`);
  assert.ok((bytes.toString('latin1').match(/\/Type\s*\/Page\b/g) ?? []).length >= 1, 'no pages');
});
