/**
 * Starts Sentry (errors) and PostHog (named events) in the browser, cookieless and only on a
 * production build. Cloudflare Web Analytics is a plain script tag in `Observability.astro`.
 * See `docs/observability.md`.
 *
 * @packageDocumentation
 * @file observability.ts
 * @author Jimmy Kurian
 * @copyright Copyright (c) 2026 Jimmy Kurian. All rights reserved. See LICENSE.
 */
import { eventFor, setCapture, track } from './track';

/** The build's public settings: set from GitHub repository variables on `main` only. */
export interface ObservabilityEnv {
  PUBLIC_SENTRY_DSN?: string;
  PUBLIC_SENTRY_RELEASE?: string;
  PUBLIC_POSTHOG_KEY?: string;
  PUBLIC_POSTHOG_HOST?: string;
}

/** The parts of Sentry this site uses. */
interface SentryLike {
  init(options: Record<string, unknown>): unknown;
}

/** The parts of PostHog this site uses. */
interface PostHogLike {
  init(key: string, options: Record<string, unknown>): unknown;
  capture(event: string, props?: Record<string, string>, options?: Record<string, unknown>): unknown;
}

/** Loads each SDK; the defaults import them, so each is only downloaded when it's used. */
export interface Loaders {
  /** Loads `@sentry/browser`. */
  sentry: () => Promise<SentryLike>;
  /** Loads `posthog-js`. */
  posthog: () => Promise<PostHogLike>;
  /** Runs `fn` once the browser is idle, so PostHog never slows the first paint. */
  idle: (fn: () => void) => void;
}

/* v8 ignore start -- these load the real SDKs in a browser; tests/e2e/observability.spec.ts covers them */
const defaultLoaders: Loaders = {
  sentry: () => import('./sentry'),
  // The slim build: PostHog's core, without autocapture, replay, surveys and the rest.
  posthog: () => import('posthog-js/dist/module.slim').then((m) => m.default),
  idle: (fn) => ('requestIdleCallback' in window ? requestIdleCallback(fn, { timeout: 4000 }) : setTimeout(fn, 2000)),
};
/* v8 ignore stop */

/** Sentry: uncaught errors from this site's own scripts. No tracing, replay or personal data. */
export function sentryOptions(env: ObservabilityEnv, origin: string): Record<string, unknown> {
  return {
    dsn: env.PUBLIC_SENTRY_DSN,
    release: env.PUBLIC_SENTRY_RELEASE,
    environment: 'production',
    // Errors from browser extensions and other sites' scripts aren't this site's.
    allowUrls: [origin],
    sendDefaultPii: false,
    tracesSampleRate: 0,
    // Errors only: no session tracking (release health) either.
    integrations: (defaults: { name: string }[]) => defaults.filter((i) => i.name !== 'BrowserSession'),
  };
}

/** PostHog: named events only, with no cookies, storage, profiles, autocapture or replay. */
export function posthogOptions(env: ObservabilityEnv): Record<string, unknown> {
  return {
    api_host: env.PUBLIC_POSTHOG_HOST,
    cookieless_mode: 'always',
    person_profiles: 'never',
    autocapture: false,
    capture_pageview: false,
    capture_pageleave: false,
    capture_exceptions: false,
    disable_session_recording: true,
    disable_surveys: true,
    advanced_disable_flags: true,
    // No extra scripts from PostHog's CDN; the Content-Security-Policy wouldn't allow them.
    disable_external_dependency_loading: true,
    // Plain JSON requests: a few bytes larger, but readable when checking what's sent.
    disable_compression: true,
  };
}

/**
 * Starts whichever tools the build has settings for. Without any (local, test and preview
 * builds), it does nothing.
 *
 * @param env - The build's public settings.
 * @param doc - The page, to listen for tracked clicks.
 * @param origin - The site's origin.
 * @param loaders - How to load each SDK.
 * @returns Resolves once the tools that were started are ready.
 */
export async function startObservability(
  env: ObservabilityEnv,
  doc: Document = document,
  origin: string = location.origin,
  loaders: Loaders = defaultLoaders,
): Promise<void> {
  const ready: Promise<unknown>[] = [];

  if (env.PUBLIC_SENTRY_DSN) {
    ready.push(loaders.sentry().then((sentry) => sentry.init(sentryOptions(env, origin))));
  }

  if (env.PUBLIC_POSTHOG_KEY && env.PUBLIC_POSTHOG_HOST) {
    const key = env.PUBLIC_POSTHOG_KEY;
    // A click on a tracked link or element. Links may leave the page, so each event is sent
    // at once (not batched), with sendBeacon.
    doc.addEventListener(
      'click',
      (e) => {
        const el = (e.target as Element | null)?.closest?.('a[href], [data-track]');
        const found = el ? eventFor(el, origin) : undefined;
        if (found) track(found.event, found.props);
      },
      { capture: true },
    );
    ready.push(
      new Promise<void>((resolve) =>
        loaders.idle(() => {
          loaders
            .posthog()
            .then((posthog) => {
              posthog.init(key, posthogOptions(env));
              setCapture((event, props) =>
                posthog.capture(event, props, { send_instantly: true, transport: 'sendBeacon' }),
              );
            })
            .finally(resolve);
        }),
      ),
    );
  }

  await Promise.all(ready);
}
