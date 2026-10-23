/**
 * @file code-metrics.test.ts
 * @author Jimmy Kurian
 * @copyright Copyright (c) 2026 Jimmy Kurian. All rights reserved. See LICENSE.
 */

import { describe, expect, it } from 'vitest';
import {
  collectComplexity,
  countInfrastructure,
  END,
  isInfrastructureCode,
  isWebsiteCode,
  renderTable,
  replaceBlock,
  START,
  sumLines,
  summarize,
} from '../../../scripts/code-metrics.mjs';

const fn = (name: string, complexity: number, file = 'website/src/lib/a.ts', line = 1) => ({
  name,
  named: true,
  file,
  line,
  complexity,
});

const measured = {
  website: { files: 2, code: 1234 },
  infrastructure: { files: 1, code: 40 },
  modules: 1,
  resources: 2,
};

describe('which files count', () => {
  it.each([
    ['website/src/lib/posts.ts', true],
    ['website/src/pages/index.astro', true],
    ['website/src/styles/global.css', true],
    ['website/scripts/resume-pdf.mjs', true],
    ['website/src/content/experience.json', false],
    ['website/src/content/posts/first.mdx', false],
    ['website/tests/unit/lib/posts.test.ts', false],
  ])('website: %s → %s', (path, expected) => {
    // Arrange (the path above)

    // Act
    const result = isWebsiteCode(path);

    // Assert
    expect(result).toBe(expected);
  });

  it.each([
    ['infrastructure/modules/azure/static-web-app/main.tf', true],
    ['infrastructure/modules/azure/static-web-app/.terraform.lock.hcl', false],
    ['infrastructure/tests/acceptance/azure/static_web_app.tftest.hcl', false],
  ])('infrastructure: %s → %s', (path, expected) => {
    // Arrange (the path above)

    // Act
    const result = isInfrastructureCode(path);

    // Assert
    expect(result).toBe(expected);
  });
});

describe('sumLines', () => {
  it("adds up files and code lines over scc's languages", () => {
    // Arrange
    const languages = [
      { Name: 'Astro', Count: 3, Code: 100 },
      { Name: 'TypeScript', Count: 2, Code: 50 },
    ];

    // Act
    const result = sumLines(languages);

    // Assert
    expect(result).toEqual({ files: 5, code: 150 });
  });
});

describe('collectComplexity', () => {
  it('reads named and anonymous functions from the complexity messages only', () => {
    // Arrange
    const results = [
      {
        filePath: '/repo/website/src/lib/goodreads.ts',
        messages: [
          {
            ruleId: 'complexity',
            line: 28,
            message: "Function 'retryDelay' has a complexity of 7. Maximum allowed is 0.",
          },
          {
            ruleId: 'complexity',
            line: 40,
            message: "Async function 'load' has a complexity of 3. Maximum allowed is 0.",
          },
          { ruleId: 'complexity', line: 50, message: 'Arrow function has a complexity of 2. Maximum allowed is 0.' },
          { ruleId: 'no-unused-vars', line: 60, message: "'x' is defined but never used." },
        ],
      },
    ];

    // Act
    const result = collectComplexity(results, '/repo');

    // Assert
    expect(result).toEqual([
      { name: 'retryDelay', named: true, file: 'website/src/lib/goodreads.ts', line: 28, complexity: 7 },
      { name: 'load', named: true, file: 'website/src/lib/goodreads.ts', line: 40, complexity: 3 },
      { name: 'arrow function', named: false, file: 'website/src/lib/goodreads.ts', line: 50, complexity: 2 },
    ]);
  });

  it("throws on a file ESLint couldn't parse, rather than skip its functions", () => {
    // Arrange
    const results = [
      {
        filePath: '/repo/website/src/pages/index.astro',
        messages: [{ ruleId: null, fatal: true, line: 3, message: 'Parsing error: Unexpected token :' }],
      },
    ];

    // Act
    const act = () => collectComplexity(results, '/repo');

    // Assert
    expect(act).toThrow("ESLint couldn't parse website/src/pages/index.astro");
  });
});

describe('countInfrastructure', () => {
  it('counts module folders and resource blocks', () => {
    // Arrange
    const sources = [
      { path: 'infrastructure/modules/azure/a/main.tf', text: 'resource "x" "one" {}\nresource "y" "two" {}\n' },
      { path: 'infrastructure/modules/azure/a/outputs.tf', text: 'output "id" { value = 1 }\n' },
      {
        path: 'infrastructure/modules/azure/b/main.tf',
        text: '  # resource "commented" "out"\nresource "z" "three" {}\n',
      },
    ];

    // Act
    const result = countInfrastructure(sources);

    // Assert
    expect(result).toEqual({ modules: 2, resources: 3 });
  });

  it.each([
    ['a /* */ block comment', 'resource "x" "live" {}\n/*\nresource "x" "disabled" {}\n*/\n'],
    ['a // line comment', 'resource "x" "live" {}\n// resource "x" "disabled" {}\n'],
    ['a # comment after the block', 'resource "x" "live" {} # resource "x" "note"\n'],
  ])('skips a resource inside %s', (_, text) => {
    // Arrange
    const sources = [{ path: 'infrastructure/modules/azure/a/main.tf', text }];

    // Act
    const result = countInfrastructure(sources);

    // Assert
    expect(result).toEqual({ modules: 1, resources: 1 });
  });

  it('keeps comment markers inside strings, so a glob or URL never hides the next resource', () => {
    // Arrange
    const text = [
      'locals { glob = "assets/*", url = "https://example.com" }',
      'resource "x" "one" {}',
      'locals { pattern = "*/" }',
      'resource "x" "two" {}',
    ].join('\n');
    const sources = [{ path: 'infrastructure/modules/azure/a/main.tf', text }];

    // Act
    const result = countInfrastructure(sources);

    // Assert
    expect(result).toEqual({ modules: 1, resources: 2 });
  });
});

describe('summarize', () => {
  it('averages the complexity and keeps the ten most complex functions, ties by file and line', () => {
    // Arrange
    const functions = [
      ...Array.from({ length: 11 }, (_, i) => fn(`f${i}`, 1, 'website/src/lib/a.ts', i + 1)),
      fn('b', 5, 'website/src/lib/b.ts', 9),
      fn('a', 5, 'website/src/lib/a.ts', 20),
    ];

    // Act
    const result = summarize({ ...measured, functions });

    // Assert
    expect(result.functions).toBe(13);
    expect(result.average).toBeCloseTo(21 / 13);
    expect(result.max).toBe(5);
    expect(result.top).toHaveLength(10);
    expect(result.top.slice(0, 3).map((f) => f.name)).toEqual(['a', 'b', 'f0']);
  });

  it.each([
    ['no website files', { website: { files: 0, code: 0 } }],
    ['no infrastructure files', { infrastructure: { files: 0, code: 0 } }],
  ])('refuses to publish empty metrics: %s', (_, override) => {
    // Arrange
    const input = { ...measured, functions: [fn('a', 1)], ...override };

    // Act
    const act = () => summarize(input);

    // Assert
    expect(act).toThrow('refusing to publish empty metrics');
  });

  it('refuses to publish empty metrics when no function was measured', () => {
    // Arrange
    const input = { ...measured, functions: [] };

    // Act
    const act = () => summarize(input);

    // Assert
    expect(act).toThrow('refusing to publish empty metrics');
  });
});

describe('renderTable', () => {
  it('renders the summary and the most complex functions as Markdown, with no date', () => {
    // Arrange
    const summary = summarize({
      ...measured,
      functions: [fn('load', 8, 'website/src/lib/goodreads.ts', 105), { ...fn('arrow function', 2), named: false }],
    });

    // Act
    const result = renderTable(summary);

    // Assert
    expect(result).toContain('| Lines of code | 1,234 | 40 | 1,274 |');
    expect(result).toContain('| Average complexity | 5.0 | – | 5.0 |');
    expect(result).toContain('| Resources | – | 2 | 2 |');
    expect(result).toContain('<summary>The 2 most complex functions</summary>');
    expect(result).toContain('| `load` | `website/src/lib/goodreads.ts:105` | 8 |');
    expect(result).toContain('| arrow function | `website/src/lib/a.ts:1` | 2 |');
    expect(result).not.toMatch(/\d{4}-\d{2}-\d{2}/);
  });
});

describe('replaceBlock', () => {
  it('replaces only the text between the markers, the same way every time', () => {
    // Arrange
    const readme = `# Title\n\n${START}\nold\n${END}\n\n## Next\n`;

    // Act
    const once = replaceBlock(readme, 'new');
    const twice = replaceBlock(once, 'new');

    // Assert
    expect(once).toBe(`# Title\n\n${START}\n\nnew\n\n${END}\n\n## Next\n`);
    expect(twice).toBe(once);
  });

  it.each([
    ['the start marker', `${END}\n`],
    ['the end marker', `${START}\n`],
    ['the markers in order', `${END}\n${START}\n`],
  ])('throws without %s', (_, readme) => {
    // Arrange (the README above)

    // Act
    const act = () => replaceBlock(readme, 'new');

    // Assert
    expect(act).toThrow('README.md needs');
  });
});
