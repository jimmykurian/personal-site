/**
 * @file WritingHero.test.ts
 * @author Jimmy Kurian
 * @copyright Copyright (c) 2026 Jimmy Kurian. All rights reserved. See LICENSE.
 */

import { describe, expect, it } from 'vitest';
import WritingHero from '../../../src/components/WritingHero.astro';
import { dom, normalize, render } from '../../support/container';

describe('WritingHero', () => {
  it('shows the label, title, intro and an RSS link by default', async () => {
    // Arrange
    const props = { label: 'Writing', title: 'Writing, patents and talks.', intro: 'Long-form notes.' };

    // Act
    const html = await render(WritingHero, { props });

    // Assert
    const root = dom(html);
    expect(root.querySelector('.page-hero__eyebrow')!.text).toBe('Writing');
    expect(root.querySelector('h1#page-title')!.text).toBe('Writing, patents and talks.');
    expect(root.querySelector('.page-hero__intro')!.text).toBe('Long-form notes.');
    const link = root.querySelector('.page-hero__rss')!;
    expect([link.getAttribute('href'), link.text]).toEqual(['/rss.xml', 'Subscribe via RSS']);
    expect(normalize(html)).toMatchSnapshot();
  });

  it('uses the link it is given', async () => {
    // Arrange
    const props = {
      label: 'Reading',
      title: 'Reading',
      link: { href: 'https://www.goodreads.com/', label: 'Follow on Goodreads' },
    };

    // Act
    const html = await render(WritingHero, { props });

    // Assert
    const link = dom(html).querySelector('.page-hero__rss')!;
    expect([link.getAttribute('href'), link.text]).toEqual(['https://www.goodreads.com/', 'Follow on Goodreads']);
  });

  it('prefers the title and intro slots, so they can hold markup', async () => {
    // Arrange
    const props = { label: 'Reading', title: 'Plain title', intro: 'Plain intro' };
    const slots = { title: 'What I’m <em>reading</em>.', intro: 'See the <a href="/x/">full list</a>.' };

    // Act
    const html = await render(WritingHero, { props, slots });

    // Assert
    const root = dom(html);
    expect(root.querySelector('h1 em')!.text).toBe('reading');
    expect(root.querySelector('.page-hero__intro a')!.getAttribute('href')).toBe('/x/');
    expect(html).not.toContain('Plain intro');
    expect(html).not.toContain('Plain title');
  });

  it('leaves the intro out when there is none', async () => {
    // Arrange
    const props = { label: 'Writing', title: 'Writing' };

    // Act
    const html = await render(WritingHero, { props });

    // Assert
    expect(dom(html).querySelector('.page-hero__intro')).toBeNull();
  });
});
