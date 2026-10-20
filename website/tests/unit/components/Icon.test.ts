/**
 * @file Icon.test.ts
 * @author Jimmy Kurian
 * @copyright Copyright (c) 2026 Jimmy Kurian. All rights reserved. See LICENSE.
 */

import { describe, expect, it } from 'vitest';
import Icon from '../../../src/components/Icon.astro';
import { dom, normalize, render } from '../../support/container';

const stroked = ['arrow', 'download', 'menu', 'close'] as const;
const filled = ['linkedin', 'github', 'stackoverflow', 'lichess', 'mail'] as const;

describe('Icon', () => {
  it.each(stroked)('draws the %s icon as strokes in the text color', async (name) => {
    // Arrange
    const props = { name };

    // Act
    const html = await render(Icon, { props });

    // Assert
    const svg = dom(html).querySelector('svg')!;
    expect(svg.getAttribute('fill')).toBe('none');
    expect(svg.getAttribute('stroke')).toBe('currentColor');
    expect(normalize(html)).toMatchSnapshot();
  });

  it.each(filled)('draws the %s mark as a solid shape in the text color', async (name) => {
    // Arrange
    const props = { name };

    // Act
    const html = await render(Icon, { props });

    // Assert
    const svg = dom(html).querySelector('svg')!;
    expect(svg.getAttribute('fill')).toBe('currentColor');
    expect(svg.querySelectorAll('path')).toHaveLength(1);
    expect(normalize(html)).toMatchSnapshot();
  });

  it('defaults to 14px and hides itself from screen readers', async () => {
    // Arrange
    const props = { name: 'arrow' };

    // Act
    const html = await render(Icon, { props });

    // Assert
    const svg = dom(html).querySelector('svg')!;
    expect(svg.getAttribute('width')).toBe('14');
    expect(svg.getAttribute('height')).toBe('14');
    expect(svg.getAttribute('aria-hidden')).toBe('true');
  });

  it('renders at the requested size', async () => {
    // Arrange
    const props = { name: 'github', size: 20 };

    // Act
    const html = await render(Icon, { props });

    // Assert
    const svg = dom(html).querySelector('svg')!;
    expect([svg.getAttribute('width'), svg.getAttribute('height')]).toEqual(['20', '20']);
  });
});
