/**
 * @file content-rules.steps.ts
 * @author Jimmy Kurian
 * @copyright Copyright (c) 2026 Jimmy Kurian. All rights reserved. See LICENSE.
 */

import { Then, When } from '@cucumber/cucumber';
import assert from 'node:assert/strict';
import site from '../../../src/data/site.json';
import { files, read } from '../../support/dist';
import { forbidden, textOf } from '../../support/rules';
import type { SiteWorld } from '../support/world';

// Everything a visitor or crawler can fetch as text.
const textFiles = () => files().filter((f) => /\.(html|xml|txt|json|svg)$/.test(f));

When('I read every published text file', function (this: SiteWorld) {
  this.remember(
    'texts',
    textFiles().map((file) => ({ file, text: textOf(read(file)) })),
  );
});

Then('none of them matches any content rule in tests\\/support\\/rules.ts', function (this: SiteWorld) {
  const texts = this.recall<{ file: string; text: string }[]>('texts');
  const hits = Object.entries(forbidden).flatMap(([rule, pattern]) =>
    texts.flatMap(({ file, text }) => {
      const match = text.match(pattern);
      return match ? [`${rule}: ${file}: ${match[0]}`] : [];
    }),
  );
  assert.deepEqual(hits, []);
});

When('I collect every email address in the published pages and feeds', function (this: SiteWorld) {
  const published = textFiles().filter((f) => f.endsWith('.html') || f.endsWith('.xml'));
  const addresses = new Set(published.flatMap((f) => read(f).match(/[\w.+-]+@[\w-]+\.[\w.]+/g) ?? []));
  // Image and asset names like logo@2x.png look like addresses; they aren't.
  this.remember(
    'addresses',
    [...addresses].filter((a) => !/\.(png|jpe?g|webp|svg|css|js)$/.test(a)),
  );
});

Then('the only one is the contact address in site.json', function (this: SiteWorld) {
  assert.deepEqual(this.recall<string[]>('addresses'), [site.email]);
});

Then('none is under \\/private\\/ or is a resume document', function (this: SiteWorld) {
  const privateFiles = this.recall<string[]>('files').filter(
    (f) => f.startsWith('/private/') || /resume.*\.(docx?|txt)$/i.test(f),
  );
  assert.deepEqual(privateFiles, []);
});
