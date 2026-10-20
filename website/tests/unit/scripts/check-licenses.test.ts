import { mkdirSync, mkdtempSync, symlinkSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { check, installedPackages, isAllowed, licenseOf, matches, readList } from '../../../scripts/check-licenses.mjs';

const allowed = ['MIT', 'ISC', 'Apache-2.0', 'BSD-*'];

describe('isAllowed', () => {
  it.each([
    ['MIT', true],
    ['GPL-3.0-only', false],
    ['BSD-3-Clause', true],
    ['(MIT OR GPL-3.0-only)', true],
    ['GPL-3.0-only OR LGPL-3.0-only', false],
    ['MIT AND ISC', true],
    ['MIT AND GPL-3.0-only', false],
    ['(GPL-3.0-only OR MIT) AND (ISC OR GPL-2.0-only)', true],
    ['Apache-2.0 WITH LLVM-exception', true],
    ['MIT or GPL-3.0-only', true],
  ])('%s → %s', (expression, expected) => {
    // Arrange (the allowed list above)

    // Act
    const result = isAllowed(expression, allowed);

    // Assert
    expect(result).toBe(expected);
  });

  it.each(['(MIT', 'MIT OR', 'OR MIT', 'MIT ISC', ''])('rejects the malformed expression "%s"', (expression) => {
    // Arrange (the allowed list above)

    // Act
    const result = isAllowed(expression, allowed);

    // Assert
    expect(result).toBe(false);
  });
});

describe('matches', () => {
  it('treats * as any characters and ignores case', () => {
    // Arrange
    const pattern = '@img/sharp-libvips-*';

    // Act
    const results = ['@img/sharp-libvips-darwin-arm64', '@IMG/Sharp-libvips-linux-x64', '@img/sharp'].map((name) =>
      matches(name, pattern),
    );

    // Assert
    expect(results).toEqual([true, true, false]);
  });
});

describe('licenseOf', () => {
  it.each([
    [{ license: 'MIT' }, 'MIT'],
    [{ license: { type: 'ISC' } }, 'ISC'],
    [{ license: ['MIT', 'Apache2'] }, 'MIT OR Apache2'],
    [{ licenses: [{ type: 'MIT' }, { type: 'Apache-2.0' }] }, 'MIT OR Apache-2.0'],
    [{}, undefined],
  ])('reads %j as %s', (manifest, expected) => {
    // Arrange (the manifest)

    // Act
    const license = licenseOf(manifest);

    // Assert
    expect(license).toBe(expected);
  });
});

describe('check', () => {
  it('fails disallowed and missing licenses, skips exclusions, and reports unused ones', () => {
    // Arrange
    const packages = [
      { name: 'ok', version: '1.0.0', license: 'MIT' },
      { name: 'copyleft', version: '1.0.0', license: 'GPL-3.0-only' },
      { name: 'unlicensed', version: '1.0.0', license: undefined },
      { name: '@img/sharp-libvips-linux-x64', version: '1.0.0', license: 'LGPL-3.0-or-later' },
    ];

    // Act
    const { failures, unused } = check(packages, allowed, ['@img/sharp-libvips-*', 'gone']);

    // Assert
    expect(failures.map((p) => p.name)).toEqual(['copyleft', 'unlicensed']);
    expect(unused).toEqual(['gone']);
  });
});

describe('files', () => {
  it('reads a list without comments or blank lines', () => {
    // Arrange
    const file = join(mkdtempSync(join(tmpdir(), 'licenses-')), 'list.txt');
    writeFileSync(file, '# heading\nMIT\n\nISC # inline note\n');

    // Act
    const list = readList(file);

    // Assert
    expect(list).toEqual(['MIT', 'ISC']);
  });

  it('collects each installed package once, scoped ones included, skipping symlinked dependencies', () => {
    // Arrange
    const nodeModules = mkdtempSync(join(tmpdir(), 'node-modules-'));
    const add = (entry: string, name: string, manifest: object) => {
      const dir = join(nodeModules, '.pnpm', entry, 'node_modules', name);
      mkdirSync(dir, { recursive: true });
      writeFileSync(join(dir, 'package.json'), JSON.stringify({ name, ...manifest }));
      return dir;
    };
    const a = add('a@1.0.0', 'a', { version: '1.0.0', license: 'MIT' });
    add('@scope+b@2.0.0', '@scope/b', { version: '2.0.0', license: 'ISC' });
    symlinkSync(a, join(nodeModules, '.pnpm', '@scope+b@2.0.0', 'node_modules', 'a'));
    mkdirSync(join(nodeModules, '.pnpm', 'node_modules'));

    // Act (sorted: directory order differs between file systems)
    const packages = installedPackages(nodeModules).sort((x, y) => x.name.localeCompare(y.name));

    // Assert
    expect(packages).toEqual([
      { name: '@scope/b', version: '2.0.0', license: 'ISC' },
      { name: 'a', version: '1.0.0', license: 'MIT' },
    ]);
  });
});
