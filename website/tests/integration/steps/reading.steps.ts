/**
 * @file reading.steps.ts
 * @author Jimmy Kurian
 * @copyright Copyright (c) 2026 Jimmy Kurian. All rights reserved. See LICENSE.
 */

import { Given, Then, When } from '@cucumber/cucumber';
import assert from 'node:assert/strict';
import type { HTMLElement } from 'node-html-parser';
import { page } from '../../support/dist';
import type { SiteWorld } from '../support/world';

const reading = (world: SiteWorld) => world.recall<HTMLElement>('reading');

Given('the reading page', function (this: SiteWorld) {
  this.remember('reading', page('/reading/index.html'));
});

When('I count the books on the favorites and software-engineering shelves', function (this: SiteWorld) {
  const root = reading(this);
  this.remember('counts', {
    favorites: root.querySelectorAll('#favorites .covers__book').length,
    'software-engineering': root.querySelectorAll('#software-engineering li.book').length,
  });
});

Then('each shelf has at least one', function (this: SiteWorld) {
  const empty = Object.entries(this.recall<Record<string, number>>('counts')).filter(([, count]) => count === 0);
  assert.deepEqual(empty, []);
});

When('I collect the book links', function (this: SiteWorld) {
  this.remember(
    'hrefs',
    reading(this)
      .querySelectorAll('.book__title, .covers__link, #current .list-title')
      .map((a) => a.getAttribute('href')!),
  );
});

Then('there is at least one link', function (this: SiteWorld) {
  assert.ok(this.recall<string[]>('hrefs').length > 0, 'no book links on /reading/');
});

Then('every one is a Goodreads book page', function (this: SiteWorld) {
  const other = this.recall<string[]>('hrefs').filter(
    (href) => !/^https:\/\/www\.goodreads\.com\/book\/show\/\d+$/.test(href),
  );
  assert.deepEqual(other, []);
});

When('I look at the software-engineering shelf', function (this: SiteWorld) {
  this.remember('shelf', reading(this).querySelector('#software-engineering')!);
});

Then('it has a {string} button only if it has more than ten books', function (this: SiteWorld, label: string) {
  const shelf = this.recall<HTMLElement>('shelf');
  const rows = shelf.querySelectorAll('[data-paged] li.book').length;
  assert.equal(Boolean(shelf.querySelector(`.${label}`)), rows > 10, `${rows} books`);
});

Then('no book is hidden in the HTML, for readers without JavaScript', function (this: SiteWorld) {
  assert.equal(this.recall<HTMLElement>('shelf').querySelectorAll('[data-paged] li[hidden]').length, 0);
});

When("I collect the page's module scripts", function (this: SiteWorld) {
  this.remember('scripts', reading(this).querySelectorAll('script[type="module"]'));
});

Then('there is at least one script', function (this: SiteWorld) {
  assert.ok(this.recall<HTMLElement[]>('scripts').length > 0, 'no module script on /reading/');
});
