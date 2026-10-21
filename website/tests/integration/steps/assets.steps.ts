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

Then('none of them is on another host', function (this: SiteWorld) {
  const external = this.recall<string[]>('sources').filter((url) => /^(https?:)?\/\//.test(url));
  assert.deepEqual(external, []);
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

Then("the page doesn't hot-link Goodreads' image host", function () {
  assert.ok(!read('/reading/index.html').includes('gr-assets.com'), '/reading/ references gr-assets.com');
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
