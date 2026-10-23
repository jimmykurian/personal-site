/**
 * @file pages.steps.ts
 * @author Jimmy Kurian
 * @copyright Copyright (c) 2026 Jimmy Kurian. All rights reserved. See LICENSE.
 */

import { Then, When } from '@cucumber/cucumber';
import assert from 'node:assert/strict';
import type { HTMLElement } from 'node-html-parser';
import site from '../../../src/data/site.json';
import { fileFor, page, pages, publishedPostIds } from '../../support/dist';
import type { SiteWorld } from '../support/world';

const SITE = 'https://www.jimmykurian.me';

When('I list the built pages', function (this: SiteWorld) {
  this.remember(
    'urls',
    pages()
      .map((p) => p.url)
      .sort(),
  );
});

Then(
  'they are the home, 404, privacy, reading, resume and writing pages, plus one page per published post',
  function (this: SiteWorld) {
    const posts = publishedPostIds().map((id) => `/writing/${id}/`);
    const expected = ['/', '/404.html', '/privacy/', '/reading/', '/resume/', '/writing/', ...posts].sort();
    assert.deepEqual(this.recall<string[]>('urls'), expected);
  },
);

Then('the draft template has no page', function () {
  assert.equal(fileFor('/writing/draft-template/'), undefined);
});

When('I check every built page', function (this: SiteWorld) {
  this.remember(
    'pages',
    pages().map(({ url, file }) => ({ url, root: page(file) })),
  );
});

Then('each is in English, with a title, a viewport and exactly one h1', function (this: SiteWorld) {
  const problems = this.recall<{ url: string; root: HTMLElement }[]>('pages').flatMap(({ url, root }) => {
    const issues = [];
    if (root.querySelector('html')?.getAttribute('lang') !== 'en') issues.push('lang');
    if (!root.querySelector('title')?.text.trim()) issues.push('title');
    if (!root.querySelector('meta[name="viewport"]')) issues.push('viewport');
    if (root.querySelectorAll('h1').length !== 1) issues.push('h1 count');
    return issues.map((issue) => `${url}: ${issue}`);
  });
  assert.deepEqual(problems, []);
});

When('I check every page except the resume and the 404 page', function (this: SiteWorld) {
  this.remember(
    'pages',
    pages()
      .filter((p) => p.url !== '/resume/' && p.url !== '/404.html')
      .map(({ url, file }) => ({ url, root: page(file) })),
  );
});

Then('each has a description and a canonical URL on the www host', function (this: SiteWorld) {
  const problems = this.recall<{ url: string; root: HTMLElement }[]>('pages').flatMap(({ url, root }) => {
    const issues = [];
    if (!root.querySelector('meta[name="description"]')?.getAttribute('content')) issues.push('description');
    const canonical = root.querySelector('link[rel="canonical"]')?.getAttribute('href');
    if (canonical !== `${SITE}${url}`) issues.push(`canonical ${canonical}`);
    return issues.map((issue) => `${url}: ${issue}`);
  });
  assert.deepEqual(problems, []);
});

Then('each link preview uses that URL and the default image', function (this: SiteWorld) {
  const problems = this.recall<{ url: string; root: HTMLElement }[]>('pages').flatMap(({ url, root }) => {
    const meta = (key: string) => root.querySelector(`meta[property="${key}"]`)?.getAttribute('content');
    const issues = [];
    if (meta('og:url') !== `${SITE}${url}`) issues.push(`og:url ${meta('og:url')}`);
    if (meta('og:image') !== `${SITE}/og-default.png`) issues.push(`og:image ${meta('og:image')}`);
    return issues.map((issue) => `${url}: ${issue}`);
  });
  assert.deepEqual(problems, []);
});

When('I open {string}', function (this: SiteWorld, file: string) {
  this.remember('page', page(file));
});

Then('it is marked noindex', function (this: SiteWorld) {
  assert.equal(
    this.recall<HTMLElement>('page').querySelector('meta[name="robots"]')?.getAttribute('content'),
    'noindex',
  );
});

Then('it has no canonical URL', function (this: SiteWorld) {
  assert.equal(this.recall<HTMLElement>('page').querySelector('link[rel="canonical"]'), null);
});

When('I find the current nav link on the writing and reading pages', function (this: SiteWorld) {
  this.remember(
    'current',
    ['/writing/index.html', '/reading/index.html'].map((file) =>
      page(file).querySelector('.nav__link[aria-current="page"]')?.getAttribute('href'),
    ),
  );
});

Then('they are {string} and {string}', function (this: SiteWorld, writing: string, reading: string) {
  assert.deepEqual(this.recall<string[]>('current'), [writing, reading]);
});

When('I collect the {string} link from every page footer', function (this: SiteWorld, text: string) {
  this.remember(
    'sources',
    pages()
      .map(({ url, file }) => ({ url, footer: page(file).querySelector('footer.site-footer') }))
      .filter(({ footer }) => footer)
      .map(({ url, footer }) => ({
        url,
        href: footer!
          .querySelectorAll('a')
          .find((a) => a.text.trim() === text)
          ?.getAttribute('href'),
      })),
  );
});

Then('the home page is among them', function (this: SiteWorld) {
  const urls = this.recall<{ url: string }[]>('sources').map((s) => s.url);
  assert.ok(urls.includes('/'), `footers found on ${urls.join(', ')}`);
});

Then('every one points at the repository in site.json', function (this: SiteWorld) {
  const wrong = this.recall<{ url: string; href?: string }[]>('sources').filter((s) => s.href !== site.repository);
  assert.deepEqual(wrong, []);
});

When('I find the pages with JSON-LD', function (this: SiteWorld) {
  this.remember(
    'withLd',
    pages()
      .filter(({ file }) => page(file).querySelector('script[type="application/ld+json"]'))
      .map((p) => p.url),
  );
});

Then('only the home page has it', function (this: SiteWorld) {
  assert.deepEqual(this.recall<string[]>('withLd'), ['/']);
});

Then('it describes the person on the www host', function () {
  const ld = JSON.parse(page('/index.html').querySelector('script[type="application/ld+json"]')!.text);
  assert.equal(ld['@type'], 'Person');
  assert.equal(ld.name, site.name);
  assert.equal(ld.url, `${SITE}/`);
});
