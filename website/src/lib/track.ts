/**
 * Named events for PostHog: `track()` and the rule that turns a click into an event.
 *
 * @packageDocumentation
 * @file track.ts
 * @author Jimmy Kurian
 * @copyright Copyright (c) 2026 Jimmy Kurian. All rights reserved. See LICENSE.
 */

/** An event's properties: only what was clicked, never anything about the visitor. */
export type EventProps = Record<string, string>;

/** Sends one event; set by `observability.ts` once PostHog has loaded. */
export type Capture = (event: string, props?: EventProps) => void;

/** Events tracked before PostHog loads are held, up to this many, then sent. */
export const QUEUE_LIMIT = 20;

let capture: Capture | undefined;
let queue: [string, EventProps | undefined][] = [];

/**
 * Sends an event to PostHog, or holds it until PostHog loads. Without PostHog (a local or
 * preview build), nothing is ever sent.
 *
 * @param event - The event name, such as `resume_pdf_download`.
 * @param props - What was clicked, such as `{ host: 'github.com' }`.
 */
export function track(event: string, props?: EventProps): void {
  if (capture) capture(event, props);
  else if (queue.length < QUEUE_LIMIT) queue.push([event, props]);
}

/**
 * Connects `track()` to PostHog, and sends the events held so far.
 *
 * @param fn - Sends one event, or `undefined` to disconnect (used by the tests).
 */
export function setCapture(fn: Capture | undefined): void {
  capture = fn;
  if (!fn) {
    queue = [];
    return;
  }
  const held = queue;
  queue = [];
  held.forEach(([event, props]) => fn(event, props));
}

/**
 * The event a click on `el` sends, if any:
 * - an element with `data-track` sends that event, with its link target
 * - a `mailto:` link sends `contact_email_click`
 * - a link to another site sends `outbound_click`, with that site's host
 *
 * @param el - The clicked link or element.
 * @param origin - The site's own origin, such as `https://www.jimmykurian.me`.
 * @returns The event name and properties, or `undefined` for a click that isn't tracked.
 */
export function eventFor(el: Element, origin: string): { event: string; props?: EventProps } | undefined {
  const href = el.getAttribute('href') ?? undefined;
  const named = el.getAttribute('data-track');
  if (named) return { event: named, props: href ? { target: href } : undefined };
  if (!href) return undefined;
  if (href.startsWith('mailto:')) return { event: 'contact_email_click' };
  let url: URL;
  try {
    url = new URL(href, origin);
  } catch {
    return undefined;
  }
  if (!/^https?:$/.test(url.protocol) || url.origin === origin) return undefined;
  return { event: 'outbound_click', props: { host: url.host } };
}
