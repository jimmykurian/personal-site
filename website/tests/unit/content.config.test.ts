import { describe, expect, it } from 'vitest';
import { collections } from '../../src/content.config';
import experience from '../../src/content/experience.json';
import projects from '../../src/content/projects.json';
import teaching from '../../src/content/teaching.json';
import writing from '../../src/content/writing.json';

type Schema = { safeParse: (v: unknown) => { success: boolean; data?: Record<string, unknown>; error?: unknown } };
const schema = (name: keyof typeof collections) => (collections[name] as unknown as { schema: Schema }).schema;
const loader = (name: keyof typeof collections) =>
  (collections[name] as unknown as { loader: { name: string } }).loader;

describe('collections', () => {
  it('defines every collection the site reads', () => {
    // Arrange
    const expected = ['posts', 'experience', 'projects', 'writing', 'teaching', 'books'];

    // Act
    const names = Object.keys(collections);

    // Assert
    expect(names).toEqual(expected);
  });

  it.each([
    ['posts', 'glob-loader'],
    ['experience', 'file-loader'],
    ['projects', 'file-loader'],
    ['writing', 'file-loader'],
    ['teaching', 'file-loader'],
    ['books', 'goodreads'],
  ] as const)('loads %s with the %s', (name, expected) => {
    // Arrange
    const collection = name;

    // Act
    const { name: loaderName } = loader(collection);

    // Assert
    expect(loaderName).toBe(expected);
  });
});

describe('JSON content', () => {
  it.each([
    ['experience', experience],
    ['projects', projects],
    ['teaching', teaching],
    ['writing', writing],
  ] as const)('every entry in %s.json matches its schema', (name, file) => {
    // Arrange
    const entries = file.map(({ id, ...data }) => [id, data] as const);

    // Act
    const failures = entries.filter(([, data]) => !schema(name).safeParse(data).success).map(([id]) => id);

    // Assert
    expect(failures).toEqual([]);
  });

  it.each([
    ['experience', experience],
    ['projects', projects],
    ['teaching', teaching],
    ['writing', writing],
  ] as const)('ids in %s.json are unique', (_, file) => {
    // Arrange
    const ids = file.map((e) => e.id);

    // Act
    const unique = new Set(ids);

    // Assert
    expect(unique.size).toBe(ids.length);
  });

  it('every logo named in experience and projects exists in src/assets', () => {
    // Arrange
    const files = Object.keys(import.meta.glob('../../src/assets/{logos,insignia}/*.{svg,png,jpg}'));
    const available = new Set(
      files.map((f) =>
        f
          .split('/')
          .pop()!
          .replace(/\.\w+$/, ''),
      ),
    );
    const named = [...experience, ...projects].map((e) => e.logo).filter(Boolean) as string[];

    // Act
    const missing = named.filter((logo) => !available.has(logo));

    // Assert
    expect(missing).toEqual([]);
  });
});

describe('posts schema', () => {
  const valid = { title: 'T', description: 'D', pubDate: '2026-10-17' };

  it('coerces dates and applies defaults', () => {
    // Arrange
    const input = valid;

    // Act
    const result = schema('posts').safeParse(input);

    // Assert
    expect(result.success).toBe(true);
    expect(result.data).toEqual({ ...valid, pubDate: new Date('2026-10-17'), tags: [], draft: false });
  });

  it.each([
    ['a missing description', { title: 'T', pubDate: '2026-10-17' }],
    ['a bad date', { ...valid, pubDate: 'someday' }],
    ['a canonical that is not a URL', { ...valid, canonical: 'medium' }],
  ])('rejects %s', (_, input) => {
    // Arrange (input from the table)

    // Act
    const result = schema('posts').safeParse(input);

    // Assert
    expect(result.success).toBe(false);
  });
});

describe('books schema', () => {
  const valid = {
    shelf: 'favorites',
    position: 0,
    title: 'T',
    author: 'A',
    rating: 5,
    toRead: false,
    readAt: null,
    addedAt: '2026-01-01',
    href: 'https://www.goodreads.com/book/show/1',
  };

  it('accepts an unread, unrated book', () => {
    // Arrange
    const input = { ...valid, rating: 0, toRead: true };

    // Act
    const result = schema('books').safeParse(input);

    // Assert
    expect(result.success).toBe(true);
  });

  it.each([
    ['a rating above five', { ...valid, rating: 6 }],
    ['a fractional rating', { ...valid, rating: 4.5 }],
    ['a cover that is not a URL', { ...valid, cover: 'cover.jpg' }],
  ])('rejects %s', (_, input) => {
    // Arrange (input from the table)

    // Act
    const result = schema('books').safeParse(input);

    // Assert
    expect(result.success).toBe(false);
  });
});

describe('experience schema', () => {
  it('defaults a role to civilian, not training, with no stack', () => {
    // Arrange
    const input = { org: 'O', role: 'R', start: 2020, end: null };

    // Act
    const result = schema('experience').safeParse(input);

    // Assert
    expect(result.data).toMatchObject({ group: 'civilian', training: false, stack: [] });
  });
});
