/**
 * @file deploy.steps.ts
 * @author Jimmy Kurian
 * @copyright Copyright (c) 2026 Jimmy Kurian. All rights reserved. See LICENSE.
 */

import { Then, When } from '@cucumber/cucumber';
import assert from 'node:assert/strict';
import { fileFor, files, read } from '../../support/dist';
import type { SiteWorld } from '../support/world';

interface StaticWebAppConfig {
  trailingSlash: string;
  responseOverrides: Record<string, { rewrite: string; statusCode: number }>;
  globalHeaders: Record<string, string>;
  routes: { route: string; headers?: Record<string, string> }[];
}

const config = (world: SiteWorld) => world.recall<StaticWebAppConfig>('config');

When('I read the Static Web Apps config', function (this: SiteWorld) {
  this.remember('config', JSON.parse(read('/staticwebapp.config.json')) as StaticWebAppConfig);
});

Then('{string} is among them', function (this: SiteWorld, file: string) {
  assert.ok(this.recall<string[]>('files').includes(file), `${file} isn't in the build`);
});

Then('a 404 is rewritten to {string} with status {int}', function (this: SiteWorld, rewrite: string, status: number) {
  assert.deepEqual(config(this).responseOverrides['404'], { rewrite, statusCode: status });
});

Then('the build has that page', function (this: SiteWorld) {
  const { rewrite } = config(this).responseOverrides['404'];
  assert.equal(fileFor(rewrite), rewrite);
});

Then('trailingSlash is {string}', function (this: SiteWorld, value: string) {
  assert.equal(config(this).trailingSlash, value);
});

Then(
  'the global headers are exactly Permissions-Policy, Referrer-Policy and X-Content-Type-Options',
  function (this: SiteWorld) {
    assert.deepEqual(Object.keys(config(this).globalHeaders).sort(), [
      'Permissions-Policy',
      'Referrer-Policy',
      'X-Content-Type-Options',
    ]);
  },
);

Then('X-Content-Type-Options is {string}', function (this: SiteWorld, value: string) {
  assert.equal(config(this).globalHeaders['X-Content-Type-Options'], value);
});

Then('the only immutable route is {string}', function (this: SiteWorld, route: string) {
  const cached = config(this).routes.filter((r) => r.headers?.['Cache-Control']?.includes('immutable'));
  assert.deepEqual(
    cached.map((r) => r.route),
    [route],
  );
});

Then('the build has files under \\/_astro\\/', function () {
  assert.ok(
    files().some((f) => f.startsWith('/_astro/')),
    'no files under /_astro/',
  );
});

When('I read the groups in robots.txt', function (this: SiteWorld) {
  this.remember(
    'groups',
    read('/robots.txt')
      .split(/\n\s*\n/)
      .map((block) => block.split('\n').filter((l) => !l.startsWith('#') && l.trim()))
      .filter((lines) => lines.length > 0),
  );
});

Then('the group for {string} disallows everything', function (this: SiteWorld, bot: string) {
  const group = this.recall<string[][]>('groups').find((lines) => lines.some((l) => l.trim() === `User-agent: ${bot}`));
  assert.ok(group?.includes('Disallow: /'), `no "Disallow: /" group for ${bot}`);
});

Then('the group for every other user agent allows everything', function (this: SiteWorld) {
  const rest = this.recall<string[][]>('groups').find((lines) => lines.includes('User-agent: *'));
  assert.ok(rest?.includes('Allow: /'), 'no "Allow: /" for User-agent: *');
});

Then('robots.txt names the sitemap index, which the build has', function () {
  assert.ok(read('/robots.txt').includes('Sitemap: https://www.jimmykurian.me/sitemap-index.xml'));
  assert.ok(fileFor('/sitemap-index.xml'), 'no /sitemap-index.xml in the build');
});
