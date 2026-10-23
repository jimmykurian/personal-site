/**
 * @file observability.test.ts
 * @author Jimmy Kurian
 * @copyright Copyright (c) 2026 Jimmy Kurian. All rights reserved. See LICENSE.
 */

import { afterEach, describe, expect, it, vi } from 'vitest';
import { posthogOptions, sentryOptions, startObservability, type Loaders } from '../../../src/lib/observability';
import { setCapture, track } from '../../../src/lib/track';

const origin = 'https://www.jimmykurian.me';
const env = {
  PUBLIC_SENTRY_DSN: 'https://public@o1.ingest.us.sentry.io/2',
  PUBLIC_SENTRY_RELEASE: 'abc123',
  PUBLIC_POSTHOG_KEY: 'phc_test',
  PUBLIC_POSTHOG_HOST: 'https://us.i.posthog.com',
};

/** Fake SDKs and a fake page, recording what the code asks of them. */
function fakes() {
  const sentry = { init: vi.fn() };
  const posthog = { init: vi.fn(), capture: vi.fn() };
  const listeners: ((e: Event) => void)[] = [];
  const doc = { addEventListener: (_: string, fn: (e: Event) => void) => listeners.push(fn) } as unknown as Document;
  const loaders: Loaders = {
    sentry: vi.fn(async () => sentry),
    posthog: vi.fn(async () => posthog),
    idle: (fn) => fn(),
  };
  /** Clicks an element that `closest()` resolves to `target`. */
  const click = (target: Record<string, string> | null) =>
    listeners.forEach((fn) =>
      fn({
        target: { closest: () => (target ? { getAttribute: (n: string) => target[n] ?? null } : null) },
      } as unknown as Event),
    );
  return { sentry, posthog, doc, loaders, listeners, click };
}

afterEach(() => setCapture(undefined));

describe('startObservability', () => {
  it('starts nothing without settings, as on local, test and preview builds', async () => {
    // Arrange
    const { doc, loaders, listeners } = fakes();

    // Act
    await startObservability({}, doc, origin, loaders);

    // Assert
    expect(loaders.sentry).not.toHaveBeenCalled();
    expect(loaders.posthog).not.toHaveBeenCalled();
    expect(listeners).toHaveLength(0);
  });

  it('starts Sentry with errors only, from this site, with no personal data', async () => {
    // Arrange
    const { sentry, doc, loaders } = fakes();

    // Act
    await startObservability({ PUBLIC_SENTRY_DSN: env.PUBLIC_SENTRY_DSN }, doc, origin, loaders);

    // Assert
    expect(sentry.init).toHaveBeenCalledOnce();
    expect(sentry.init.mock.calls[0][0]).toMatchObject({ dsn: env.PUBLIC_SENTRY_DSN, allowUrls: [origin] });
    expect(sentryOptions(env, origin)).toMatchObject({
      dsn: env.PUBLIC_SENTRY_DSN,
      release: 'abc123',
      allowUrls: [origin],
      sendDefaultPii: false,
      tracesSampleRate: 0,
    });
    const integrations = sentryOptions(env, origin).integrations as (d: { name: string }[]) => { name: string }[];
    expect(integrations([{ name: 'GlobalHandlers' }, { name: 'BrowserSession' }])).toEqual([
      { name: 'GlobalHandlers' },
    ]);
    expect(loaders.posthog).not.toHaveBeenCalled();
  });

  it('starts PostHog cookieless, with no pageviews, autocapture, replay or profiles', async () => {
    // Arrange
    const { posthog, doc, loaders } = fakes();

    // Act
    await startObservability(env, doc, origin, loaders);

    // Assert
    expect(posthog.init).toHaveBeenCalledWith('phc_test', posthogOptions(env));
    expect(posthogOptions(env)).toMatchObject({
      api_host: 'https://us.i.posthog.com',
      cookieless_mode: 'always',
      person_profiles: 'never',
      autocapture: false,
      capture_pageview: false,
      disable_session_recording: true,
    });
  });

  it('needs both the PostHog key and host', async () => {
    // Arrange
    const { doc, loaders } = fakes();

    // Act
    await startObservability({ PUBLIC_POSTHOG_KEY: 'phc_test' }, doc, origin, loaders);

    // Assert
    expect(loaders.posthog).not.toHaveBeenCalled();
  });

  it('sends a tracked click to PostHog with sendBeacon, and ignores untracked ones', async () => {
    // Arrange
    const { posthog, doc, loaders, click } = fakes();
    await startObservability(env, doc, origin, loaders);

    // Act
    click({ href: 'https://github.com/jimmykurian' });
    click({ href: '/writing/' });
    click(null);
    track('headline_pause');

    // Assert
    expect(posthog.capture.mock.calls).toEqual([
      ['outbound_click', { host: 'github.com' }, { send_instantly: true, transport: 'sendBeacon' }],
      ['headline_pause', undefined, { send_instantly: true, transport: 'sendBeacon' }],
    ]);
  });
});
