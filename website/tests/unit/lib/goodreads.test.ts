import { describe, expect, it, vi } from 'vitest';
import { goodreadsLoader } from '../../../src/lib/goodreads';

type Item = Partial<
  Record<
    | 'book_id'
    | 'title'
    | 'author_name'
    | 'user_rating'
    | 'user_shelves'
    | 'user_read_at'
    | 'user_date_added'
    | 'book_large_image_url',
    string
  >
>;

// One <item> as Goodreads writes it: some fields wrapped in CDATA, some entity-encoded.
const item = (fields: Item) =>
  `<item>${Object.entries({
    book_id: '1',
    title: 'A Book',
    author_name: 'An Author',
    user_rating: '0',
    user_shelves: '',
    user_read_at: '',
    user_date_added: 'Sat, 01 Feb 2026 10:00:00 -0800',
    book_large_image_url: '',
    ...fields,
  })
    .map(([tag, value]) => `<${tag}><![CDATA[${value}]]></${tag}>`)
    .join('\n')}</item>`;

const feed = (...items: string[]) => `<?xml version="1.0"?><rss><channel>${items.join('')}</channel></rss>`;

/** Serves `pages[shelf][n - 1]` for page n, then empty feeds. */
function stubGoodreads(pages: Record<string, string[][]>, status = 200) {
  const fetch = vi.fn(async (url: string | URL) => {
    const { searchParams } = new URL(url);
    const items = pages[searchParams.get('shelf')!]?.[Number(searchParams.get('page')) - 1] ?? [];
    return new Response(feed(...items), { status });
  });
  vi.stubGlobal('fetch', fetch);
  return fetch;
}

function context() {
  const entries = new Map<string, { id: string; data: Record<string, unknown> }>();
  const store = {
    clear: vi.fn(() => entries.clear()),
    set: vi.fn((entry: { id: string; data: Record<string, unknown> }) => entries.set(entry.id, entry)),
  };
  const logger = { info: vi.fn() };
  const parseData = vi.fn(async ({ data }: { id: string; data: Record<string, unknown> }) => data);
  return { entries, store, logger, parseData, ctx: { store, logger, parseData } as never };
}

const load = (shelves: string[], ctx: never) => goodreadsLoader({ userId: '52431533', shelves }).load(ctx);

describe('goodreadsLoader', () => {
  it('is named for the build log', () => {
    // Arrange
    const loader = goodreadsLoader({ userId: '1', shelves: [] });

    // Act
    const { name } = loader;

    // Assert
    expect(name).toBe('goodreads');
  });

  it('turns each feed item into a book entry', async () => {
    // Arrange
    stubGoodreads({
      favorites: [
        [
          item({
            book_id: '42',
            title: 'Accelerate: The Science of Lean Software and DevOps (IT Revolution, #1)',
            author_name: 'Nicole Forsgren',
            user_rating: '5',
            user_shelves: 'favorites, software-engineering',
            user_read_at: 'Mon, 05 Jan 2026 00:00:00 -0800',
            book_large_image_url: 'https://i.gr-assets.com/images/S/compressed.photo.goodreads.com/books/42l.jpg',
          }),
          item({
            book_id: '7',
            title: 'Team Topologies',
            user_shelves: 'to-read',
            book_large_image_url: 'https://s.gr-assets.com/assets/nophoto/book/111x148.png',
          }),
        ],
      ],
    });
    const { entries, ctx } = context();

    // Act
    await load(['favorites'], ctx);

    // Assert
    expect([...entries.values()]).toMatchSnapshot();
  });

  it('decodes entities and splits the subtitle from the title', async () => {
    // Arrange
    stubGoodreads({
      shelf: [
        [item({ title: 'Code &amp; Craft: Notes &#8212; Volume&#x2019;s One: Part Two', author_name: 'O&apos;Brien' })],
      ],
    });
    const { entries, ctx } = context();

    // Act
    await load(['shelf'], ctx);

    // Assert
    const { data } = entries.get('shelf-1')!;
    expect(data.title).toBe('Code & Craft');
    expect(data.subtitle).toBe('Notes — Volume’s One: Part Two');
    expect(data.author).toBe("O'Brien");
  });

  it('leaves the subtitle undefined when the title has none', async () => {
    // Arrange
    stubGoodreads({ shelf: [[item({ title: 'Refactoring (2nd Edition)' })]] });
    const { entries, ctx } = context();

    // Act
    await load(['shelf'], ctx);

    // Assert
    expect(entries.get('shelf-1')!.data).toMatchObject({ title: 'Refactoring', subtitle: undefined });
  });

  it('reads every page until an empty one, and keeps feed order as the position', async () => {
    // Arrange
    const fetch = stubGoodreads({
      shelf: [[item({ book_id: '1' }), item({ book_id: '2' })], [item({ book_id: '3' })]],
    });
    const { entries, logger, ctx } = context();

    // Act
    await load(['shelf'], ctx);

    // Assert
    expect(fetch).toHaveBeenCalledTimes(3);
    expect(fetch.mock.calls[0][0]).toBe('https://www.goodreads.com/review/list_rss/52431533?shelf=shelf&page=1');
    expect([...entries.values()].map((e) => [e.id, e.data.position])).toEqual([
      ['shelf-1', 0],
      ['shelf-2', 1],
      ['shelf-3', 2],
    ]);
    expect(logger.info).toHaveBeenCalledWith('shelf: 3 books');
  });

  it('stops after 20 pages', async () => {
    // Arrange
    const fetch = stubGoodreads({ shelf: Array.from({ length: 25 }, (_, i) => [item({ book_id: String(i) })]) });
    const { entries, ctx } = context();

    // Act
    await load(['shelf'], ctx);

    // Assert
    expect(fetch).toHaveBeenCalledTimes(20);
    expect(entries.size).toBe(20);
  });

  it('keeps one entry per shelf for a book on several shelves', async () => {
    // Arrange
    stubGoodreads({ favorites: [[item({ book_id: '9' })]], 'software-engineering': [[item({ book_id: '9' })]] });
    const { entries, ctx } = context();

    // Act
    await load(['favorites', 'software-engineering'], ctx);

    // Assert
    expect([...entries.keys()]).toEqual(['favorites-9', 'software-engineering-9']);
  });

  it('identifies itself to Goodreads', async () => {
    // Arrange
    const fetch = stubGoodreads({});
    const { ctx } = context();

    // Act
    await load(['shelf'], ctx);

    // Assert
    expect(fetch).toHaveBeenCalledWith(expect.any(String), { headers: { 'User-Agent': 'jimmykurian.me build' } });
  });

  it('fails the build when Goodreads errors, without touching the store', async () => {
    // Arrange
    stubGoodreads({}, 503);
    const { store, ctx } = context();

    // Act
    const result = load(['favorites'], ctx);

    // Assert
    await expect(result).rejects.toThrow('Goodreads favorites page 1: HTTP 503');
    expect(store.clear).not.toHaveBeenCalled();
  });

  it('replaces the store contents with schema-checked entries', async () => {
    // Arrange
    stubGoodreads({ shelf: [[item({ book_id: '1' })]] });
    const { store, parseData, ctx } = context();

    // Act
    await load(['shelf'], ctx);

    // Assert
    expect(store.clear).toHaveBeenCalledBefore(store.set);
    expect(parseData).toHaveBeenCalledWith(expect.objectContaining({ id: 'shelf-1' }));
    expect(store.set).toHaveBeenCalledTimes(1);
  });
});
