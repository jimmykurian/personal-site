import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join, relative, sep } from 'node:path';
import { parse, type HTMLElement } from 'node-html-parser';
import { inject } from 'vitest';

/** The built site's dist/ directory, from the integration setup. */
export const distDir = () => join(inject('buildRoot'), 'dist');

/** Every file in dist/, as site paths ("/writing/index.html"). */
export function files(): string[] {
  const root = distDir();
  return (readdirSync(root, { recursive: true, withFileTypes: true }) as import('node:fs').Dirent[])
    .filter((d) => d.isFile())
    .map((d) => '/' + relative(root, join(d.parentPath, d.name)).split(sep).join('/'))
    .sort();
}

/** Built HTML pages, as site URLs ("/writing/") with their file path. */
export function pages(): { url: string; file: string }[] {
  return files()
    .filter((f) => f.endsWith('.html'))
    .map((file) => ({ file, url: file.replace(/index\.html$/, '') }));
}

export const read = (path: string) => readFileSync(join(distDir(), path), 'utf8');

export const page = (path: string): HTMLElement => parse(read(path));

/** The file a site URL is served from, or undefined if the build has none. */
export function fileFor(url: string): string | undefined {
  const path = decodeURIComponent(url.split(/[?#]/)[0]);
  const candidates = path.endsWith('/') ? [`${path}index.html`] : [path, `${path}/index.html`, `${path}.html`];
  return candidates.find((c) => existsSync(join(distDir(), c)));
}

/** Published (non-draft) post ids, read from the frontmatter in src/content/posts/. */
export function publishedPostIds(): string[] {
  const dir = join(import.meta.dirname, '../../src/content/posts');
  return readdirSync(dir, { withFileTypes: true })
    .map((d) => {
      const file = d.isDirectory() ? join(dir, d.name, 'index.mdx') : join(dir, d.name);
      if (!file.endsWith('.mdx') || !existsSync(file)) return undefined;
      const draft = /^draft:\s*true\s*$/m.test(readFileSync(file, 'utf8').split(/^---$/m)[1] ?? '');
      return draft ? undefined : d.name.replace(/\.mdx$/, '');
    })
    .filter((id): id is string => Boolean(id))
    .sort();
}
