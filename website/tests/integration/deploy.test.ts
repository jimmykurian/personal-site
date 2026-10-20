import { describe, expect, it } from 'vitest';
import { fileFor, files, read } from '../support/dist';

const config = () => JSON.parse(read('/staticwebapp.config.json'));

describe('Azure Static Web Apps config', () => {
  it('is copied into the build', () => {
    // Arrange
    const published = files();

    // Act
    const present = published.includes('/staticwebapp.config.json');

    // Assert
    expect(present).toBe(true);
  });

  it('serves the built 404 page for missing URLs', () => {
    // Arrange
    const { responseOverrides } = config();

    // Act
    const notFound = responseOverrides['404'];

    // Assert
    expect(notFound).toEqual({ rewrite: '/404.html', statusCode: 404 });
    expect(fileFor(notFound.rewrite)).toBe('/404.html');
  });

  it('serves files without a trailing-slash redirect', () => {
    // Arrange
    const { trailingSlash } = config();

    // Act (read from the config)

    // Assert
    expect(trailingSlash).toBe('auto');
  });

  it('sends the security headers', () => {
    // Arrange
    const { globalHeaders } = config();

    // Act
    const names = Object.keys(globalHeaders).sort();

    // Assert
    expect(names).toEqual(['Permissions-Policy', 'Referrer-Policy', 'X-Content-Type-Options']);
    expect(globalHeaders['X-Content-Type-Options']).toBe('nosniff');
  });

  it('caches hashed assets for a year, and only those', () => {
    // Arrange
    const { routes } = config();

    // Act
    const cached = routes.filter((r: { headers?: Record<string, string> }) =>
      r.headers?.['Cache-Control']?.includes('immutable'),
    );

    // Assert
    expect(cached.map((r: { route: string }) => r.route)).toEqual(['/_astro/*']);
    expect(files().some((f) => f.startsWith('/_astro/'))).toBe(true);
  });
});

describe('robots.txt', () => {
  const groups = () =>
    read('/robots.txt')
      .split(/\n\s*\n/)
      .map((block) => block.split('\n').filter((l) => !l.startsWith('#') && l.trim()))
      .filter((lines) => lines.length > 0);

  it.each(['GPTBot', 'ClaudeBot', 'Google-Extended', 'CCBot', 'Applebot-Extended', 'Meta-ExternalAgent', 'Bytespider'])(
    'blocks the %s training crawler',
    (bot) => {
      // Arrange
      const all = groups();

      // Act
      const group = all.find((lines) => lines.some((l) => l.trim() === `User-agent: ${bot}`));

      // Assert
      expect(group).toContain('Disallow: /');
    },
  );

  it('allows everyone else and points at the sitemap', () => {
    // Arrange
    const text = read('/robots.txt');

    // Act
    const rest = groups().find((lines) => lines.includes('User-agent: *'));

    // Assert
    expect(rest).toContain('Allow: /');
    expect(text).toContain('Sitemap: https://www.jimmykurian.me/sitemap-index.xml');
    expect(fileFor('/sitemap-index.xml')).toBeDefined();
  });
});
