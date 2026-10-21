/**
 * @file links.steps.ts
 * @author Jimmy Kurian
 * @copyright Copyright (c) 2026 Jimmy Kurian. All rights reserved. See LICENSE.
 */

import { Then, When } from '@cucumber/cucumber';
import assert from 'node:assert/strict';
import { fileFor, page, pages } from '../../support/dist';
import type { SiteWorld } from '../support/world';

const SITE = 'https://www.jimmykurian.me';

// Files produced after the build by other steps.
const generatedLater = new Set(['/resume.pdf']);

/**
 * A reference's path on this site: root-relative as written, or the path of an absolute URL
 * whose origin is exactly the site's. A prefix check would also accept another host that
 * starts with the same name, such as www.jimmykurian.me.example.com.
 */
function sitePath(url: string): string | undefined {
  if (url.startsWith('/')) return url;
  if (!URL.canParse(url)) return undefined;
  const { origin, pathname, search, hash } = new URL(url);
  return origin === SITE ? `${pathname}${search}${hash}` : undefined;
}

/** Every internal URL a page references, from links, images, scripts and styles. */
function references(file: string): string[] {
  const root = page(file);
  const urls = [
    ...root.querySelectorAll('a[href], link[href]').map((el) => el.getAttribute('href')!),
    ...root.querySelectorAll('img[src], script[src]').map((el) => el.getAttribute('src')!),
    ...root.querySelectorAll('img[srcset], source[srcset]').flatMap((el) =>
      el
        .getAttribute('srcset')!
        .split(',')
        .map((s) => s.trim().split(/\s+/)[0]),
    ),
  ];
  return urls.map(sitePath).filter((url): url is string => url !== undefined && !url.startsWith('//'));
}

When(
  'I collect every internal URL each page references, from links, images, scripts and styles',
  function (this: SiteWorld) {
    this.remember(
      'references',
      pages().flatMap(({ url, file }) =>
        references(file)
          .filter((ref) => !generatedLater.has(ref.split('#')[0]))
          .map((ref) => ({ page: url, ref })),
      ),
    );
  },
);

Then('each one resolves to a file in the build', function (this: SiteWorld) {
  const missing = this.recall<{ page: string; ref: string }[]>('references').filter(({ ref }) => !fileFor(ref));
  assert.deepEqual(missing, []);
});

When('I collect every same-site link with a #fragment', function (this: SiteWorld) {
  this.remember(
    'anchors',
    pages().flatMap(({ url, file }) =>
      page(file)
        .querySelectorAll('a[href*="#"]')
        .map((a) => a.getAttribute('href')!)
        .filter((href) => href.startsWith('#') || href.startsWith('/'))
        .map((href) => {
          const [path, id] = href.split('#');
          return { page: url, href, target: fileFor(path || url)!, id };
        })
        .filter(({ id }) => id),
    ),
  );
});

Then('each fragment matches an id on its target page', function (this: SiteWorld) {
  const missing = this.recall<{ page: string; href: string; target: string; id: string }[]>('anchors')
    .filter(({ target, id }) => !page(target).getElementById(decodeURIComponent(id)))
    .map(({ page: from, href }) => `${from} -> ${href}`);
  assert.deepEqual(missing, []);
});

When('I collect the internal page links, without file extensions', function (this: SiteWorld) {
  this.remember(
    'hrefs',
    pages().flatMap(({ file }) =>
      page(file)
        .querySelectorAll('a[href^="/"]')
        .map((a) => a.getAttribute('href')!.split('#')[0])
        .filter((href) => href && !/\.\w+$/.test(href)),
    ),
  );
});

Then('none of them is missing its trailing slash', function (this: SiteWorld) {
  const withoutSlash = [...new Set(this.recall<string[]>('hrefs').filter((href) => !href.endsWith('/')))];
  assert.deepEqual(withoutSlash, []);
});
