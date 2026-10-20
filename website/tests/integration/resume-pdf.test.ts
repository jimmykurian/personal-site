import { execFile } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { promisify } from 'node:util';
import { afterAll, describe, expect, inject, it } from 'vitest';

const chrome = [
  process.env.CHROME_PATH,
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  '/usr/bin/google-chrome',
  '/usr/bin/google-chrome-stable',
  '/usr/bin/chromium',
  '/usr/bin/chromium-browser',
].find((p) => p && existsSync(p));

const script = resolve(import.meta.dirname, '../../scripts/resume-pdf.mjs');

describe.skipIf(!chrome)('resume PDF', () => {
  const dirs: string[] = [];
  afterAll(() => Promise.all(dirs.map((d) => rm(d, { recursive: true, force: true }))));

  it('prints the built /resume/ page to a PDF', async () => {
    // Arrange
    const out = await mkdtemp(join(tmpdir(), 'resume-pdf-'));
    dirs.push(out);
    const pdf = join(out, 'resume.pdf');

    // Act
    const { stdout } = await promisify(execFile)(process.execPath, [script, pdf], { cwd: inject('buildRoot') });

    // Assert
    const bytes = readFileSync(pdf);
    expect(stdout).toContain(`resume-pdf: wrote ${pdf}`);
    expect(bytes.subarray(0, 5).toString()).toBe('%PDF-');
    expect(bytes.length).toBeGreaterThan(20_000);
    expect((bytes.toString('latin1').match(/\/Type\s*\/Page\b/g) ?? []).length).toBeGreaterThanOrEqual(1);
  });
});
