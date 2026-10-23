/**
 * @file privacy.test.ts
 * @author Jimmy Kurian
 * @copyright Copyright (c) 2026 Jimmy Kurian. All rights reserved. See LICENSE.
 */

import { describe, expect, it } from 'vitest';
import Privacy from '../../../src/pages/privacy.astro';
import site from '../../../src/data/site.json';
import { dom, normalize, render } from '../../support/container';

describe('privacy page', () => {
  it('names each tool, says there are no cookies, and gives the public contact address', async () => {
    // Arrange
    const path = '/privacy/';

    // Act
    const html = await render(Privacy, { path });

    // Assert
    const root = dom(html);
    expect(root.querySelector('title')!.text).toBe(`Privacy · ${site.name}`);
    expect(root.querySelector('h1')!.text).toBe('No cookies, no profiles.');
    expect(root.querySelectorAll('.privacy__body li a').map((a) => a.text)).toEqual([
      'Cloudflare Web Analytics',
      'Sentry',
      'PostHog',
    ]);
    expect(root.querySelector('.privacy__body a[href^="mailto:"]')!.getAttribute('href')).toBe(
      'mailto:hello@jimmykurian.me',
    );
    expect(root.querySelector('link[rel="canonical"]')!.getAttribute('href')).toBe(
      'https://www.jimmykurian.me/privacy/',
    );
    expect(normalize(root.querySelector('main')!.innerHTML)).toMatchSnapshot();
  });
});
