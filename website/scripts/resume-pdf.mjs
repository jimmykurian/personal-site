/**
 * @file resume-pdf.mjs
 * @author Jimmy Kurian
 * @copyright Copyright (c) 2026 Jimmy Kurian. All rights reserved. See LICENSE.
 */

// Prints the built /resume/ page to dist/resume.pdf with headless Chrome.
// Run after `astro build`: `pnpm resume`. Serves dist/ itself, so it needs no other packages.
import { createServer } from 'node:http';
import { execFile } from 'node:child_process';
import { existsSync } from 'node:fs';
import { readFile } from 'node:fs/promises';
import { extname, join, normalize, resolve } from 'node:path';
import { promisify } from 'node:util';

const dist = resolve('dist');
const out = resolve(process.argv[2] ?? join(dist, 'resume.pdf'));

const types = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css',
  '.js': 'text/javascript',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.webp': 'image/webp',
  '.woff2': 'font/woff2',
  '.woff': 'font/woff',
};

const chromeCandidates = [
  process.env.CHROME_PATH,
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  '/usr/bin/google-chrome',
  '/usr/bin/google-chrome-stable',
  '/usr/bin/chromium',
  '/usr/bin/chromium-browser',
].filter(Boolean);

const chrome = chromeCandidates.find((p) => existsSync(p));
if (!chrome) {
  console.error('resume-pdf: Chrome not found. Set CHROME_PATH to a Chrome or Chromium binary.');
  process.exit(1);
}
if (!existsSync(join(dist, 'resume', 'index.html'))) {
  console.error('resume-pdf: dist/resume/index.html is missing. Run `pnpm build` first.');
  process.exit(1);
}

const server = createServer(async (req, res) => {
  const path = normalize(decodeURIComponent(new URL(req.url, 'http://x').pathname));
  let file = join(dist, path);
  if (!file.startsWith(dist)) return res.writeHead(403).end();
  if (path.endsWith('/')) file = join(file, 'index.html');
  try {
    const body = await readFile(file);
    res.writeHead(200, { 'Content-Type': types[extname(file)] ?? 'application/octet-stream' }).end(body);
  } catch {
    res.writeHead(404).end();
  }
});

await new Promise((ok) => server.listen(0, '127.0.0.1', ok));
const { port } = server.address();

try {
  await promisify(execFile)(chrome, [
    '--headless=new',
    '--disable-gpu',
    '--no-sandbox',
    '--no-pdf-header-footer',
    '--virtual-time-budget=5000',
    `--print-to-pdf=${out}`,
    `http://127.0.0.1:${port}/resume/`,
  ]);
  console.log(`resume-pdf: wrote ${out}`);
} finally {
  server.close();
}
