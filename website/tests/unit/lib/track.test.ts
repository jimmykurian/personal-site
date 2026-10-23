/**
 * @file track.test.ts
 * @author Jimmy Kurian
 * @copyright Copyright (c) 2026 Jimmy Kurian. All rights reserved. See LICENSE.
 */

import { afterEach, describe, expect, it, vi } from 'vitest';
import { eventFor, QUEUE_LIMIT, setCapture, track } from '../../../src/lib/track';

const origin = 'https://www.jimmykurian.me';

/** A stand-in for a clicked element with the given attributes. */
const el = (attrs: Record<string, string>) => ({ getAttribute: (name: string) => attrs[name] ?? null }) as Element;

afterEach(() => setCapture(undefined));

describe('track', () => {
  it('sends straight to PostHog once it has loaded', () => {
    // Arrange
    const capture = vi.fn();
    setCapture(capture);

    // Act
    track('resume_pdf_download', { target: '/resume.pdf' });

    // Assert
    expect(capture).toHaveBeenCalledWith('resume_pdf_download', { target: '/resume.pdf' });
  });

  it('holds events tracked before PostHog loads, then sends them in order', () => {
    // Arrange
    track('headline_pause');
    track('headline_play');
    const capture = vi.fn();

    // Act
    setCapture(capture);

    // Assert
    expect(capture.mock.calls).toEqual([
      ['headline_pause', undefined],
      ['headline_play', undefined],
    ]);
  });

  it(`holds at most ${QUEUE_LIMIT} events`, () => {
    // Arrange
    for (let i = 0; i < QUEUE_LIMIT + 5; i++) track('reading_show_more');
    const capture = vi.fn();

    // Act
    setCapture(capture);

    // Assert
    expect(capture).toHaveBeenCalledTimes(QUEUE_LIMIT);
  });

  it('drops the held events when PostHog is disconnected', () => {
    // Arrange
    track('headline_pause');
    setCapture(undefined);
    const capture = vi.fn();

    // Act
    setCapture(capture);

    // Assert
    expect(capture).not.toHaveBeenCalled();
  });
});

describe('eventFor', () => {
  it.each([
    [
      { 'data-track': 'resume_pdf_download', href: '/resume.pdf' },
      { event: 'resume_pdf_download', props: { target: '/resume.pdf' } },
    ],
    [{ 'data-track': 'headline_pause' }, { event: 'headline_pause', props: undefined }],
    [{ href: 'mailto:hello@jimmykurian.me' }, { event: 'contact_email_click' }],
    [{ href: 'https://github.com/jimmykurian' }, { event: 'outbound_click', props: { host: 'github.com' } }],
    [{ href: '//www.linkedin.com/in/x' }, { event: 'outbound_click', props: { host: 'www.linkedin.com' } }],
  ])('%o sends %o', (attrs, expected) => {
    // Arrange (the attributes above)

    // Act
    const result = eventFor(el(attrs), origin);

    // Assert
    expect(result).toEqual(expected);
  });

  it.each([
    [{}],
    [{ href: '/writing/' }],
    [{ href: '#projects' }],
    [{ href: `${origin}/reading/` }],
    [{ href: 'tel:123' }],
    [{ href: 'http://[bad' }],
  ])('%o sends nothing', (attrs) => {
    // Arrange (the attributes above)

    // Act
    const result = eventFor(el(attrs), origin);

    // Assert
    expect(result).toBeUndefined();
  });
});
