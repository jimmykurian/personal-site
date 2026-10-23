/**
 * @file assets.steps.ts
 * @author Jimmy Kurian
 * @copyright Copyright (c) 2026 Jimmy Kurian. All rights reserved. See LICENSE.
 */

import { Then, When } from '@cucumber/cucumber';
import assert from 'node:assert/strict';
import type { HTMLElement } from 'node-html-parser';
import { files, page, pages, read } from '../../support/dist';
import type { SiteWorld } from '../support/world';

When("I collect the sources of every page's images, scripts, stylesheets and preloads", function (this: SiteWorld) {
  this.remember(
    'sources',
    pages().flatMap(({ file }) => {
      const root = page(file);
      return [
        ...root
          .querySelectorAll('img[src], script[src], source[srcset]')
          .map((el) => el.getAttribute('src') ?? el.getAttribute('srcset')!),
        ...root.querySelectorAll('link[rel="stylesheet"], link[rel="preload"]').map((el) => el.getAttribute('href')!),
      ];
    }),
  );
});

/** The only other host a page may load a script from: Cloudflare Web Analytics' beacon. */
const BEACON = 'https://static.cloudflareinsights.com/beacon.min.js';

/** Where the observability tools send data (docs/observability.md). */
const CONNECT = [
  "'self'",
  'https://cloudflareinsights.com',
  'https://*.ingest.us.sentry.io',
  'https://us.i.posthog.com',
];

Then("none of them is on another host, except Cloudflare's analytics beacon", function (this: SiteWorld) {
  const external = this.recall<string[]>('sources').filter((url) => /^(https?:)?\/\//.test(url) && url !== BEACON);
  assert.deepEqual(external, []);
});

When("I read every page's Content-Security-Policy", function (this: SiteWorld) {
  this.remember(
    'policies',
    pages().map(({ file }) => {
      const meta = page(file).querySelector('meta[http-equiv="content-security-policy"]');
      assert.ok(meta, `${file} has no Content-Security-Policy`);
      const directives = new Map<string, string[]>();
      for (const part of meta.getAttribute('content')!.split(';')) {
        const [name, ...values] = part.trim().split(/\s+/);
        if (name) directives.set(name, values);
      }
      return { file, directives };
    }),
  );
});

type Policy = { file: string; directives: Map<string, string[]> };

Then("scripts may load only from the site and Cloudflare's analytics beacon", function (this: SiteWorld) {
  for (const { file, directives } of this.recall<Policy[]>('policies')) {
    const hosts = (directives.get('script-src') ?? []).filter((v) => !v.startsWith("'sha"));
    assert.deepEqual(hosts, ["'self'", 'https://static.cloudflareinsights.com'], file);
    assert.deepEqual(directives.get('default-src'), ["'self'"], file);
  }
});

Then('connections may go only to the site, Cloudflare, Sentry and PostHog', function (this: SiteWorld) {
  for (const { file, directives } of this.recall<Policy[]>('policies')) {
    assert.deepEqual(directives.get('connect-src'), CONNECT, file);
  }
});

When('I list the built font files', function (this: SiteWorld) {
  this.remember(
    'fonts',
    files().filter((f) => f.endsWith('.woff2')),
  );
});

Then('there is at least one woff2 file', function (this: SiteWorld) {
  assert.ok(this.recall<string[]>('fonts').length > 0, 'no woff2 files in the build');
});

Then("no page or stylesheet mentions Google's font hosts", function () {
  const text = [...files().filter((f) => f.endsWith('.css')), ...pages().map((p) => p.file)].map(read).join('\n');
  assert.doesNotMatch(text, /fonts\.(googleapis|gstatic)\.com/);
});

When('I collect the cover images on the reading page', function (this: SiteWorld) {
  this.remember(
    'covers',
    page('/reading/index.html')
      .querySelectorAll('img')
      .map((img) => img.getAttribute('src')!),
  );
});

Then('there is at least one', function (this: SiteWorld) {
  assert.ok(this.recall<string[]>('covers').length > 0, 'no covers on /reading/');
});

Then('every one is served from \\/_astro\\/', function (this: SiteWorld) {
  const elsewhere = this.recall<string[]>('covers').filter((src) => !src.startsWith('/_astro/'));
  assert.deepEqual(elsewhere, []);
});

// Goodreads serves its cover images from gr-assets.com and its subdomains.
const isGoodreadsImageHost = (hostname: string) => hostname === 'gr-assets.com' || hostname.endsWith('.gr-assets.com');

Then("nothing on the page loads from Goodreads' image host", function () {
  const root = page('/reading/index.html');
  const urls = [
    ...root.querySelectorAll('[src], [href]').map((el) => el.getAttribute('src') ?? el.getAttribute('href')!),
    ...root.querySelectorAll('[srcset]').flatMap((el) =>
      el
        .getAttribute('srcset')!
        .split(',')
        .map((s) => s.trim().split(/\s+/)[0]),
    ),
  ];
  const hotLinked = urls.filter((url) => URL.canParse(url) && isGoodreadsImageHost(new URL(url).hostname));
  assert.deepEqual(hotLinked, []);
});

When('I collect every image on every page', function (this: SiteWorld) {
  this.remember(
    'images',
    pages().flatMap(({ url, file }) =>
      page(file)
        .querySelectorAll('img')
        .map((img) => ({ url, img })),
    ),
  );
});

Then("each has an alt attribute, empty only when it's decorative", function (this: SiteWorld) {
  const missing = this.recall<{ url: string; img: HTMLElement }[]>('images')
    .filter(({ img }) => !img.hasAttribute('alt'))
    .map(({ url, img }) => `${url} ${img.getAttribute('src')}`);
  assert.deepEqual(missing, []);
});

When('I list the built files', function (this: SiteWorld) {
  this.remember('files', files());
});

Then('{string} and {string} are among them', function (this: SiteWorld, first: string, second: string) {
  const published = this.recall<string[]>('files');
  assert.deepEqual(
    [first, second].filter((f) => published.includes(f)),
    [first, second],
  );
});
