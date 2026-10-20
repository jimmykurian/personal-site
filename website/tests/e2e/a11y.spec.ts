import AxeBuilder from '@axe-core/playwright';
import { expect, routes, test } from './fixtures';

// WCAG 2.1 A and AA, the level the site aims for.
const tags = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'];

test.describe('accessibility', () => {
  for (const route of routes) {
    test(`${route} has no WCAG A or AA violations`, async ({ page }) => {
      // Arrange
      await page.goto(route);

      // Act
      const { violations } = await new AxeBuilder({ page }).withTags(tags).analyze();

      // Assert
      expect(violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(' ')).join(', ')}`)).toEqual([]);
    });
  }
});
