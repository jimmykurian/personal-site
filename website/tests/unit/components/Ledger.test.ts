/**
 * @file Ledger.test.ts
 * @author Jimmy Kurian
 * @copyright Copyright (c) 2026 Jimmy Kurian. All rights reserved. See LICENSE.
 */

import { describe, expect, it } from 'vitest';
import Ledger from '../../../src/components/Ledger.astro';
import { dom, normalize, render } from '../../support/container';

describe('Ledger', () => {
  it('labels the section by its display heading', async () => {
    // Arrange
    const props = { id: 'projects', label: 'Projects', heading: 'Selected work' };

    // Act
    const html = await render(Ledger, { props, slots: { default: '<p>Body</p>' } });

    // Assert
    const root = dom(html);
    const section = root.querySelector('section')!;
    expect(section.id).toBe('projects');
    expect(section.getAttribute('aria-labelledby')).toBe('projects-title');
    expect(section.getAttribute('aria-label')).toBeUndefined();
    expect(root.querySelector('h2#projects-title')!.text).toBe('Selected work');
    expect(root.querySelector('.ledger__label p.caps')!.text).toBe('Projects');
    expect(normalize(html)).toMatchSnapshot();
  });

  it('makes the label the h2 when there is no display heading', async () => {
    // Arrange
    const props = { id: 'talks', label: 'Talks', labelIsHeading: true };

    // Act
    const html = await render(Ledger, { props });

    // Assert
    const root = dom(html);
    expect(root.querySelector('section')!.getAttribute('aria-labelledby')).toBe('talks-title');
    expect(root.querySelector('h2.caps#talks-title')!.text).toBe('Talks');
    expect(root.querySelector('.section-title')).toBeNull();
  });

  it('names an unheaded section with aria-label instead', async () => {
    // Arrange
    const props = { label: 'Notes' };

    // Act
    const html = await render(Ledger, { props });

    // Assert
    const section = dom(html).querySelector('section')!;
    expect(section.getAttribute('aria-label')).toBe('Notes');
    expect(section.getAttribute('aria-labelledby')).toBeUndefined();
  });

  it('adds the note, the label slot, the bare modifier and extra classes', async () => {
    // Arrange
    const props = { label: 'Writing', note: 'Selected', bare: true, class: 'extra' };

    // Act
    const html = await render(Ledger, { props, slots: { label: '<a href="/writing/">All writing</a>' } });

    // Assert
    const root = dom(html);
    expect(root.querySelector('section')!.classList.contains('extra')).toBe(true);
    expect(root.querySelector('.ledger')!.classList.contains('ledger--bare')).toBe(true);
    expect(root.querySelector('.ledger__label .note')!.text).toBe('Selected');
    expect(root.querySelector('.ledger__label a')!.getAttribute('href')).toBe('/writing/');
  });
});
