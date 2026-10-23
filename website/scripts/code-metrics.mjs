/**
 * @file code-metrics.mjs
 * @author Jimmy Kurian
 * @copyright Copyright (c) 2026 Jimmy Kurian. All rights reserved. See LICENSE.
 */

// Measures the code (task metrics): lines of code with scc, and the cyclomatic complexity of
// every function with ESLint's complexity rule, run on the website's own ESLint config. With
// --write it replaces the table between the METRICS markers in ../README.md (task
// metrics:readme), which .github/workflows/code-metrics.yml proposes in a pull request. Only
// git-tracked files count, so local folders such as .terraform/ never do.
import { execFileSync } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

export const START = '<!-- METRICS:START -->';
export const END = '<!-- METRICS:END -->';

/** The website's code: components, pages, styles and scripts, not content or data. */
export const isWebsiteCode = (path) => /^website\/(src|scripts)\//.test(path) && /\.(astro|ts|mjs|js|css)$/.test(path);
/** The OpenTofu modules, without their generated lock files. */
export const isInfrastructureCode = (path) => /^infrastructure\/modules\/.+\.tf$/.test(path);

/** Files and code lines (no blanks or comments) from scc's JSON, summed over its languages. */
export function sumLines(sccLanguages) {
  return sccLanguages.reduce(
    (sum, language) => ({ files: sum.files + language.Count, code: sum.code + language.Code }),
    { files: 0, code: 0 },
  );
}

/**
 * Every function ESLint's complexity rule reported, as { name, named, file, line, complexity },
 * from ESLint's results. An anonymous function's name is its kind, such as "arrow function". `root` makes the file paths relative. Throws on a file ESLint couldn't
 * parse, whose functions would otherwise go uncounted.
 */
export function collectComplexity(results, root) {
  const functions = [];
  for (const result of results) {
    for (const message of result.messages) {
      if (message.fatal)
        throw new Error(`ESLint couldn't parse ${relative(root, result.filePath)}: ${message.message}`);
      if (message.ruleId !== 'complexity') continue;
      const match = /^(.+?) has a complexity of (\d+)/.exec(message.message);
      if (!match) continue;
      const named = /'(.+)'$/.exec(match[1]);
      functions.push({
        name: named ? named[1] : match[1].toLowerCase(),
        named: Boolean(named),
        file: relative(root, result.filePath),
        line: message.line,
        complexity: Number(match[2]),
      });
    }
  }
  return functions;
}

/** Module folders and `resource` blocks in the OpenTofu sources, given as { path, text }. */
export function countInfrastructure(sources) {
  const modules = new Set(sources.map(({ path }) => dirname(path)));
  const resources = sources.reduce((sum, { text }) => sum + (text.match(/^resource\s+"/gm) ?? []).length, 0);
  return { modules: modules.size, resources };
}

/** The summary the table shows. Throws rather than report an empty measurement. */
export function summarize({ website, infrastructure, functions, modules, resources }) {
  if (website.files === 0 || infrastructure.files === 0 || functions.length === 0) {
    throw new Error('measured no files or no functions; refusing to publish empty metrics');
  }
  const scores = functions.map((f) => f.complexity);
  const top = [...functions]
    .sort((a, b) => b.complexity - a.complexity || a.file.localeCompare(b.file) || a.line - b.line)
    .slice(0, 10);
  return {
    website,
    infrastructure,
    functions: functions.length,
    average: scores.reduce((sum, n) => sum + n, 0) / scores.length,
    max: Math.max(...scores),
    modules,
    resources,
    top,
  };
}

const number = (n) => n.toLocaleString('en-US');

/** The Markdown between the markers: the summary table and the most complex functions. */
export function renderTable(summary) {
  const { website, infrastructure } = summary;
  const rows = [
    ['Files', number(website.files), number(infrastructure.files), number(website.files + infrastructure.files)],
    ['Lines of code', number(website.code), number(infrastructure.code), number(website.code + infrastructure.code)],
    ['Functions', number(summary.functions), '–', number(summary.functions)],
    ['Average complexity', summary.average.toFixed(1), '–', summary.average.toFixed(1)],
    ['Max complexity', String(summary.max), '–', String(summary.max)],
    ['Modules', '–', number(summary.modules), number(summary.modules)],
    ['Resources', '–', number(summary.resources), number(summary.resources)],
  ];
  const top = summary.top.map(
    (f) => `| ${f.named ? `\`${f.name}\`` : f.name} | \`${f.file}:${f.line}\` | ${f.complexity} |`,
  );
  return [
    '| Metric | Website | Infrastructure | Total |',
    '| --- | --- | --- | --- |',
    ...rows.map((row) => `| ${row.join(' | ')} |`),
    '',
    '<details>',
    `<summary>The ${summary.top.length} most complex functions</summary>`,
    '',
    '| Function | Where | Complexity |',
    '| --- | --- | --- |',
    ...top,
    '',
    '</details>',
  ].join('\n');
}

/** `readme` with the text between the markers replaced by `block`. Throws if a marker is missing. */
export function replaceBlock(readme, block) {
  const start = readme.indexOf(START);
  const end = readme.indexOf(END);
  if (start === -1 || end === -1 || end < start) throw new Error(`README.md needs ${START} and then ${END}`);
  return `${readme.slice(0, start + START.length)}\n\n${block}\n\n${readme.slice(end)}`;
}

async function main() {
  const root = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..');
  const tracked = execFileSync('git', ['ls-files'], { cwd: root, encoding: 'utf8' }).split('\n');
  const websiteFiles = tracked.filter(isWebsiteCode);
  const infrastructureFiles = tracked.filter(isInfrastructureCode);
  const scc = (files) =>
    files.length
      ? sumLines(
          JSON.parse(
            execFileSync('scc', ['--format', 'json', '--no-cocomo', ...files], { cwd: root, encoding: 'utf8' }),
          ),
        )
      : { files: 0, code: 0 };

  // ESLint runs from website/ as `pnpm lint` does: the Astro parser finds the TypeScript parser
  // from the working directory. At max 0, the complexity rule reports every function.
  process.chdir(join(root, 'website'));
  const { ESLint } = await import('eslint');
  const eslint = new ESLint({ globInputPaths: false, overrideConfig: { rules: { complexity: ['error', 0] } } });
  const scripts = websiteFiles.filter((path) => !path.endsWith('.css')).map((path) => join(root, path));
  const functions = collectComplexity(await eslint.lintFiles(scripts), root);

  const summary = summarize({
    website: scc(websiteFiles),
    infrastructure: scc(infrastructureFiles),
    functions,
    ...countInfrastructure(infrastructureFiles.map((path) => ({ path, text: readFileSync(join(root, path), 'utf8') }))),
  });
  const block = renderTable(summary);
  if (process.argv.includes('--write')) {
    const readme = join(root, 'README.md');
    writeFileSync(readme, replaceBlock(readFileSync(readme, 'utf8'), block));
    console.log('metrics: updated README.md');
  } else {
    console.log(block);
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((error) => {
    console.error(`metrics: ${error.message}`);
    process.exit(1);
  });
}
