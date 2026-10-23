/**
 * @file feeds.steps.ts
 * @author Jimmy Kurian
 * @copyright Copyright (c) 2026 Jimmy Kurian. All rights reserved. See LICENSE.
 */

import { Then, When } from '@cucumber/cucumber';
import assert from 'node:assert/strict';
import { fileFor, files, publishedPostIds, read } from '../../support/dist';
import type { SiteWorld } from '../support/world';

const SITE = 'https://www.jimmykurian.me';

// The feed and sitemap are small, generated XML, so plain patterns read them reliably.
const blocks = (xml: string, tag: string) =>
  [...xml.matchAll(new RegExp(`<${tag}>([\\s\\S]*?)</${tag}>`, 'g'))].map((m) => m[1]);
const field = (xml: string, tag: string) => (blocks(xml, tag)[0] ?? '').replace(/^<!\[CDATA\[|\]\]>$/g, '').trim();

When('I read the items in the RSS feed', function (this: SiteWorld) {
  this.remember('items', blocks(read('/rss.xml'), 'item'));
});

Then("their links are the published posts' absolute URLs", function (this: SiteWorld) {
  const links = this.recall<string[]>('items')
    .map((item) => field(item, 'link'))
    .sort();
  assert.deepEqual(
    links,
    publishedPostIds().map((id) => `${SITE}/writing/${id}/`),
  );
});

Then('every link is a page in the build', function (this: SiteWorld) {
  const missing = this.recall<string[]>('items')
    .map((item) => field(item, 'link'))
    .filter((link) => !fileFor(link.slice(SITE.length)));
  assert.deepEqual(missing, []);
});

When("I read the RSS feed's channel", function (this: SiteWorld) {
  this.remember('channel', blocks(read('/rss.xml'), 'channel')[0].replace(/<item>[\s\S]*<\/item>/, ''));
});

Then('its title is {string}', function (this: SiteWorld, title: string) {
  assert.equal(field(this.recall<string>('channel'), 'title'), title);
});

Then('its link is the home page on the www host', function (this: SiteWorld) {
  assert.equal(field(this.recall<string>('channel'), 'link'), `${SITE}/`);
});

Then('its language is {string}', function (this: SiteWorld, language: string) {
  assert.equal(field(this.recall<string>('channel'), 'language'), language);
});

Then('there is at least one item', function (this: SiteWorld) {
  assert.ok(this.recall<string[]>('items').length > 0, 'the feed has no items');
});

Then('each has a title, a description and a valid publish date', function (this: SiteWorld) {
  const incomplete = this.recall<string[]>('items').filter(
    (item) => !field(item, 'title') || !field(item, 'description') || Number.isNaN(Date.parse(field(item, 'pubDate'))),
  );
  assert.deepEqual(incomplete, []);
});

When('I read the sitemap index', function (this: SiteWorld) {
  this.remember(
    'sitemaps',
    blocks(read('/sitemap-index.xml'), 'loc').map((loc) => loc.slice(SITE.length)),
  );
});

Then('it lists at least one sitemap', function (this: SiteWorld) {
  assert.ok(this.recall<string[]>('sitemaps').length > 0, 'the sitemap index lists nothing');
});

Then('every one it lists is in the build', function (this: SiteWorld) {
  const missing = this.recall<string[]>('sitemaps').filter((path) => !fileFor(path));
  assert.deepEqual(missing, []);
});

When('I collect the URLs in every sitemap', function (this: SiteWorld) {
  this.remember(
    'urls',
    files()
      .filter((f) => /^\/sitemap-\d+\.xml$/.test(f))
      .flatMap((f) => blocks(read(f), 'loc'))
      .sort(),
  );
});

Then(
  'they are the home, privacy, reading and writing pages plus every published post, on the www host',
  function (this: SiteWorld) {
    const expected = ['/', '/privacy/', '/reading/', '/writing/', ...publishedPostIds().map((id) => `/writing/${id}/`)]
      .map((p) => SITE + p)
      .sort();
    assert.deepEqual(this.recall<string[]>('urls'), expected);
  },
);
