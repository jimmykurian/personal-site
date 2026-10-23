/**
 * @file Observability.test.ts
 * @author Jimmy Kurian
 * @copyright Copyright (c) 2026 Jimmy Kurian. All rights reserved. See LICENSE.
 */

import { afterEach, describe, expect, it, vi } from 'vitest';
import Observability from '../../../src/components/Observability.astro';
import { dom, render } from '../../support/container';

const beacon = 'script[src="https://static.cloudflareinsights.com/beacon.min.js"]';

afterEach(() => vi.unstubAllEnvs());

describe('Observability', () => {
  it('adds no Cloudflare beacon without its token, as on local, test and preview builds', async () => {
    // Arrange
    vi.stubEnv('PUBLIC_CF_BEACON_TOKEN', '');

    // Act
    const html = await render(Observability);

    // Assert
    expect(dom(html).querySelector(beacon)).toBeNull();
  });

  it('adds the Cloudflare beacon with its token on a production build', async () => {
    // Arrange
    vi.stubEnv('PUBLIC_CF_BEACON_TOKEN', 'test-beacon-token');

    // Act
    const html = await render(Observability);

    // Assert
    const script = dom(html).querySelector(beacon)!;
    expect(script.getAttribute('type')).toBe('module');
    expect(JSON.parse(script.getAttribute('data-cf-beacon')!)).toEqual({ token: 'test-beacon-token' });
  });
});
