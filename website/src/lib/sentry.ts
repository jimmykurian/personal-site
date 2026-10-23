/**
 * The one part of `@sentry/browser` the site uses. Importing it through this module lets the
 * bundler leave out the rest of the SDK (replay, tracing, feedback), which a dynamic import of
 * the whole package can't.
 *
 * @packageDocumentation
 * @file sentry.ts
 * @author Jimmy Kurian
 * @copyright Copyright (c) 2026 Jimmy Kurian. All rights reserved. See LICENSE.
 */
export { init } from '@sentry/browser';
