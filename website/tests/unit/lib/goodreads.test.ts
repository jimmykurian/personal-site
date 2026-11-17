/**
 * @file goodreads.test.ts
 * @author Jimmy Kurian
 * @copyright Copyright (c) 2026 Jimmy Kurian. All rights reserved. See LICENSE.
 */

import { mkdtempSync, readFileSync, rmSync, statSync, utimesSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { goodreadsLoader } from '../../../src/lib/goodreads';

type Listed = {
  id?: string;
  title?: string;
  author?: string;
  stars?: number;
  average?: boolean;
  tags?: string;
  cover?: string;
};

const COVERS = 'https://i.gr-assets.com/images/S/compressed.photo.goodreads.com/books';
const star = (kind: string) => `<img src="https://s.gr-assets.com/images/layout/gr_flat_red_star_${kind}.png" />`;

// One book as the widget writes it. Its book id appears only in the cover's address.
const entry = ({
  id = '1',
  title = 'A Book',
  author = 'An Author',
  stars = 0,
  average = false,
  tags,
  cover,
}: Listed) => `
  <div class="gr_custom_each_container_9">
    <div class="gr_custom_book_container_9">
      <a title="${title}" rel="nofollow" href="https://www.goodreads.com/review/show/77"><img alt="${title}" border="0" src="${cover ?? `${COVERS}/1541870875l/${id}._SX98_.jpg`}" /></a>
    </div>
    <div class="gr_custom_rating_9">
      <span class=" staticStars notranslate">${star('active').repeat(stars)}${average ? star('25pct') : ''}${star('inactive')}</span>
    </div>
    <div class="gr_custom_author_9">
      by <a rel="nofollow" href="https://www.goodreads.com/author/show/3">${author}</a>
    </div>
    ${tags === undefined ? '' : `<div class="gr_custom_tags_9">\n tagged:\n ${tags}\n </div>`}
  </div>`;

// The script Goodreads serves: the widget's HTML, escaped into one JavaScript string.
const widget = (shelf: string, ...entries: string[]) => {
  const html = `<h2><a rel="nofollow" href="https://www.goodreads.com/review/list/52431533-jimmy?shelf=${shelf}&amp;utm_medium=api">Jimmy&#39;s books</a></h2>${entries.join('')}`;
  const code = html
    .replace(/\\/g, '\\\\')
    .replace(/<\//g, '<\\/')
    .replace(/\n/g, '\\n')
    .replace(/"/g, '\\"')
    .replace(/'/g, "\\'");
  return `  var widget_code = '${code}'\n  var widget_div = document.getElementById('gr_custom_widget_9')\n`;
};

/** Serves each shelf's entries as its widget. */
function stubGoodreads(shelves: Record<string, string[]>, status = 200) {
  const fetch = vi.fn(async (url: string | URL) => {
    const shelf = new URL(url).searchParams.get('shelf')!;
    return new Response(widget(shelf, ...(shelves[shelf] ?? [])), { status });
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
  const logger = { info: vi.fn(), warn: vi.fn() };
  const parseData = vi.fn(async ({ data }: { id: string; data: Record<string, unknown> }) => data);
  return { entries, store, logger, parseData, ctx: { store, logger, parseData } as never };
}

/** Answers each request with the next response in turn; the last one repeats. */
function stubResponses(...responses: (() => Response | Promise<never>)[]) {
  const fetch = vi.fn(async () => (responses.length > 1 ? responses.shift()! : responses[0])());
  vi.stubGlobal('fetch', fetch);
  return fetch;
}

// Each test saves its books in its own temporary folder.
let dir: string;
let saved: string;

const NOW = '2026-11-17T12:00:00.000Z';

const load = (shelves: string[], ctx: never, refresh = false, pending?: string) =>
  goodreadsLoader({ userId: '52431533', shelves, saved, refresh, pending }).load(ctx);

// The loader reads the saved file before it calls Goodreads, and fake timers don't wait for
// that read. Real setImmediate does.
const tick = () => new Promise((resolve) => setImmediate(resolve));

/** Refreshes with fake timers, so retry waits pass instantly and new books are dated NOW. */
async function refresh(shelves: string[], ctx: never, pending?: string) {
  let settled = false;
  const result = load(shelves, ctx, true, pending);
  result.catch(() => {}).finally(() => (settled = true));
  while (!settled) {
    await tick();
    await vi.runAllTimersAsync();
  }
  return result;
}

/** Waits for the loader's first request, from which the retry waits are timed. */
async function firstRequest(fetch: { mock: { calls: unknown[] } }) {
  while (fetch.mock.calls.length === 0) await tick();
}

const book = (shelf: string, id: string, position: number, data: Record<string, unknown> = {}) => ({
  id: `${shelf}-${id}`,
  data: {
    shelf,
    position,
    title: `Book ${id}`,
    author: 'An Author',
    rating: 0,
    toRead: false,
    readAt: null,
    addedAt: '2020-01-01T00:00:00.000Z',
    href: `https://www.goodreads.com/book/show/${id}`,
    ...data,
  },
});

const save = (...books: unknown[]) => writeFileSync(saved, `${JSON.stringify(books, null, 2)}\n`);
const savedNow = () => JSON.parse(readFileSync(saved, 'utf8')) as ReturnType<typeof book>[];

describe('goodreadsLoader', () => {
  beforeEach(() => {
    dir = mkdtempSync(join(tmpdir(), 'goodreads-'));
    saved = join(dir, 'books.json');
    vi.useFakeTimers({ toFake: ['setTimeout', 'Date'], now: new Date(NOW) });
  });

  afterEach(() => {
    vi.useRealTimers();
    rmSync(dir, { recursive: true, force: true });
  });

  it('is named for the build log', () => {
    // Arrange
    const loader = goodreadsLoader({ userId: '1', shelves: [], saved: 'books.json' });

    // Act
    const { name } = loader;

    // Assert
    expect(name).toBe('goodreads');
  });

  describe('in a build', () => {
    it('loads the saved books without calling Goodreads', async () => {
      // Arrange
      const books = [book('favorites', '5', 0), book('favorites', '6', 1)];
      save(...books);
      const fetch = stubGoodreads({});
      const { entries, ctx } = context();

      // Act
      await load(['favorites'], ctx);

      // Assert
      expect([...entries.values()]).toEqual(books);
      expect(fetch).not.toHaveBeenCalled();
    });

    it('replaces the store contents with schema-checked entries', async () => {
      // Arrange
      save(book('shelf', '1', 0));
      const { store, parseData, ctx } = context();

      // Act
      await load(['shelf'], ctx);

      // Assert
      expect(store.clear).toHaveBeenCalledBefore(store.set);
      expect(parseData).toHaveBeenCalledWith(expect.objectContaining({ id: 'shelf-1' }));
      expect(store.set).toHaveBeenCalledTimes(1);
    });

    it('leaves the saved file alone', async () => {
      // Arrange
      writeFileSync(saved, JSON.stringify([book('shelf', '1', 0)]));
      utimesSync(saved, 0, 0);

      // Act
      await load(['shelf'], context().ctx);

      // Assert
      expect(statSync(saved).mtimeMs).toBe(0);
    });

    it('fails when there are no saved books, without touching the store', async () => {
      // Arrange
      const { store, ctx } = context();

      // Act
      const result = load(['favorites'], ctx);

      // Assert
      await expect(result).rejects.toThrow('ENOENT');
      expect(store.clear).not.toHaveBeenCalled();
    });
  });

  describe('on a refresh', () => {
    it('turns each new widget book into a book entry, dated now', async () => {
      // Arrange
      save();
      stubGoodreads({
        favorites: [
          entry({
            id: '42',
            title: 'Accelerate: The Science of Lean Software and DevOps (IT Revolution, #1)',
            author: 'Nicole Forsgren',
            stars: 5,
            tags: 'software-engineering and favorites',
          }),
          entry({ id: '7', title: 'Team Topologies', tags: 'to-read, favorites and software-engineering' }),
        ],
      });
      const { entries, ctx } = context();

      // Act
      await refresh(['favorites'], ctx);

      // Assert
      expect([...entries.values()]).toMatchSnapshot();
    });

    it('decodes entities and splits the subtitle from the title', async () => {
      // Arrange
      save();
      stubGoodreads({
        shelf: [
          entry({
            title: 'Code &amp; Craft: Notes &#8212; Volume&#x2019;s One: Part Two',
            author: 'O&#39;Brien &amp; S&oslash;n',
          }),
        ],
      });
      const { entries, ctx } = context();

      // Act
      await refresh(['shelf'], ctx);

      // Assert
      const { data } = entries.get('shelf-1')!;
      expect(data.title).toBe('Code & Craft');
      expect(data.subtitle).toBe('Notes — Volume’s One: Part Two');
      expect(data.author).toBe("O'Brien & S&oslash;n");
    });

    it('leaves the subtitle undefined when the title has none', async () => {
      // Arrange
      save();
      stubGoodreads({ shelf: [entry({ title: 'Refactoring (2nd Edition)' })] });
      const { entries, ctx } = context();

      // Act
      await refresh(['shelf'], ctx);

      // Assert
      expect(entries.get('shelf-1')!.data).toMatchObject({ title: 'Refactoring', subtitle: undefined });
    });

    it.each([
      ['._SX98_.jpg', '.jpg'],
      ['._SY475_.jpg', '.jpg'],
      ['._SX318_SY475_.jpg', '.jpg'],
      ['.jpg', '.jpg'],
    ])('saves the full-size cover for one ending %s', async (suffix, expected) => {
      // Arrange
      save();
      stubGoodreads({ shelf: [entry({ cover: `${COVERS}/1541870875l/1${suffix}` })] });
      const { entries, ctx } = context();

      // Act
      await refresh(['shelf'], ctx);

      // Assert
      expect(entries.get('shelf-1')!.data.cover).toBe(`${COVERS}/1541870875l/1${expected}`);
    });

    it('skips a book without a cover, which carries the book id, with a warning', async () => {
      // Arrange
      save();
      stubGoodreads({
        shelf: [
          entry({ title: 'No Cover', cover: 'https://s.gr-assets.com/assets/nophoto/book/111x148.png' }),
          entry({ id: '2' }),
        ],
      });
      const { entries, logger, ctx } = context();

      // Act
      await refresh(['shelf'], ctx);

      // Assert
      expect([...entries.keys()]).toEqual(['shelf-2']);
      expect(logger.warn).toHaveBeenCalledWith(
        'shelf: skipped "No Cover", which has no cover to take its book id from',
      );
    });

    it('reads what it can of an entry with parts missing', async () => {
      // Arrange
      save();
      const bare = (inner: string) => `<div class="gr_custom_each_container_9">${inner}</div>`;
      stubGoodreads({
        shelf: [bare(`<img alt="" border="0" src="${COVERS}/1541870875l/5.jpg" />`), bare('<p>&nbsp;</p>')],
      });
      const { entries, logger, ctx } = context();

      // Act
      await refresh(['shelf'], ctx);

      // Assert
      expect([...entries.keys()]).toEqual(['shelf-5']);
      expect(entries.get('shelf-5')!.data).toMatchObject({ title: '', author: '', rating: 0, toRead: false });
      expect(logger.warn).toHaveBeenCalledWith('shelf: skipped "", which has no cover to take its book id from');
    });

    it('asks for the 100 newest books of each shelf, each under its own fresh widget id', async () => {
      // Arrange
      save();
      const fetch = stubGoodreads({});
      const { logger, ctx } = context();

      // Act
      await refresh(['favorites', 'software-engineering'], ctx);

      // Assert
      const first = Math.floor(new Date(NOW).getTime() / 1000);
      expect(fetch.mock.calls.map(([url]) => url)).toEqual([
        `https://www.goodreads.com/review/custom_widget/52431533?shelf=favorites&num_books=100&sort=date_added&order=d&show_author=1&show_cover=1&show_rating=1&show_tags=1&show_title=1&widget_id=${first}`,
        `https://www.goodreads.com/review/custom_widget/52431533?shelf=software-engineering&num_books=100&sort=date_added&order=d&show_author=1&show_cover=1&show_rating=1&show_tags=1&show_title=1&widget_id=${first + 1}`,
      ]);
      expect(logger.info).toHaveBeenCalledWith('favorites: 0 books read, 0 saved');
    });

    it('identifies itself to Goodreads', async () => {
      // Arrange
      save();
      const fetch = stubGoodreads({});
      const { ctx } = context();

      // Act
      await refresh(['shelf'], ctx);

      // Assert
      expect(fetch).toHaveBeenCalledWith(expect.any(String), { headers: { 'User-Agent': 'jimmykurian.me build' } });
    });

    it('keeps one entry per shelf for a book on several shelves', async () => {
      // Arrange
      save();
      stubGoodreads({ favorites: [entry({ id: '9' })], 'software-engineering': [entry({ id: '9' })] });
      const { entries, ctx } = context();

      // Act
      await refresh(['favorites', 'software-engineering'], ctx);

      // Assert
      expect([...entries.keys()]).toEqual(['favorites-9', 'software-engineering-9']);
    });

    it('puts new books first, then the saved books in their saved order', async () => {
      // Arrange
      save(book('shelf', '3', 1), book('shelf', '2', 0));
      stubGoodreads({ shelf: [entry({ id: '5' }), entry({ id: '3' }), entry({ id: '4' }), entry({ id: '2' })] });
      const { entries, ctx } = context();

      // Act
      await refresh(['shelf'], ctx);

      // Assert
      expect([...entries.values()].map((e) => [e.id, e.data.position, e.data.addedAt])).toEqual([
        ['shelf-5', 0, NOW],
        ['shelf-4', 1, NOW],
        ['shelf-2', 2, '2020-01-01T00:00:00.000Z'],
        ['shelf-3', 3, '2020-01-01T00:00:00.000Z'],
      ]);
    });

    it("keeps a saved book's own fields, and takes the widget's rating and to-read mark", async () => {
      // Arrange
      save(
        book('shelf', '1', 0, { title: 'Saved Title', readAt: '2021-05-05T00:00:00.000Z', rating: 3, toRead: true }),
      );
      stubGoodreads({ shelf: [entry({ id: '1', title: 'Widget Title', stars: 4, tags: 'shelf' })] });
      const { entries, ctx } = context();

      // Act
      await refresh(['shelf'], ctx);

      // Assert
      expect(entries.get('shelf-1')!.data).toMatchObject({
        title: 'Saved Title',
        readAt: '2021-05-05T00:00:00.000Z',
        rating: 4,
        toRead: false,
      });
    });

    it('dates a saved book as read on the day its to-read mark goes', async () => {
      // Arrange
      save(book('shelf', '1', 0, { toRead: true }), book('shelf', '2', 1, { toRead: true }));
      stubGoodreads({ shelf: [entry({ id: '1', tags: 'shelf' }), entry({ id: '2', tags: 'to-read and shelf' })] });
      const { entries, ctx } = context();

      // Act
      await refresh(['shelf'], ctx);

      // Assert
      expect(entries.get('shelf-1')!.data).toMatchObject({ toRead: false, readAt: NOW });
      expect(entries.get('shelf-2')!.data).toMatchObject({ toRead: true, readAt: null });
    });

    it("reads a part-filled star as the book's average, not a rating", async () => {
      // Arrange
      save(book('shelf', '1', 0, { rating: 2 }));
      stubGoodreads({
        shelf: [entry({ id: '1', stars: 3, average: true }), entry({ id: '2', stars: 3, average: true })],
      });
      const { entries, ctx } = context();

      // Act
      await refresh(['shelf'], ctx);

      // Assert
      expect(entries.get('shelf-1')!.data.rating).toBe(2);
      expect(entries.get('shelf-2')!.data.rating).toBe(0);
    });

    it('drops saved books that left a shelf the widget lists in full', async () => {
      // Arrange
      save(book('shelf', '1', 0), book('shelf', '2', 1), book('other', '1', 0));
      stubGoodreads({ shelf: [entry({ id: '2' })] });
      const { entries, ctx } = context();

      // Act
      await refresh(['shelf'], ctx);

      // Assert
      expect([...entries.keys()]).toEqual(['shelf-2']);
      expect(entries.get('shelf-2')!.data.position).toBe(0);
    });

    it('drops nothing from a shelf that fills the widget, which may be cut short', async () => {
      // Arrange
      save(book('shelf', 'old', 0));
      stubGoodreads({ shelf: Array.from({ length: 100 }, (_, i) => entry({ id: String(i + 1) })) });
      const { entries, ctx } = context();

      // Act
      await refresh(['shelf'], ctx);

      // Assert
      expect(entries.size).toBe(101);
      expect(entries.get('shelf-old')!.data.position).toBe(100);
    });

    it('drops nothing when the widget is full, even if one of its books was skipped', async () => {
      // Arrange
      save(book('shelf', 'old', 0));
      const noCover = entry({ title: 'No Cover', cover: 'https://s.gr-assets.com/assets/nophoto/book/111x148.png' });
      stubGoodreads({ shelf: [noCover, ...Array.from({ length: 99 }, (_, i) => entry({ id: String(i + 1) }))] });
      const { entries, ctx } = context();

      // Act
      await refresh(['shelf'], ctx);

      // Assert
      expect(entries.size).toBe(100);
      expect(entries.has('shelf-old')).toBe(true);
    });

    it('keeps the dates an unmerged refresh already gave a new or newly read book', async () => {
      // Arrange
      const earlier = '2026-11-10T12:00:00.000Z';
      save(book('shelf', '1', 0, { toRead: true }), book('shelf', '2', 1, { toRead: true }));
      const pending = join(dir, 'pending.json');
      writeFileSync(
        pending,
        JSON.stringify([
          book('shelf', '1', 1, { readAt: earlier }),
          book('shelf', '3', 0, { addedAt: earlier }),
          book('shelf', '2', 2, { toRead: true }),
        ]),
      );
      stubGoodreads({
        shelf: [
          entry({ id: '4' }),
          entry({ id: '3' }),
          entry({ id: '2', tags: 'shelf' }),
          entry({ id: '1', tags: 'shelf' }),
        ],
      });
      const { entries, ctx } = context();

      // Act
      await refresh(['shelf'], ctx, pending);

      // Assert
      expect(entries.get('shelf-1')!.data.readAt).toBe(earlier);
      expect(entries.get('shelf-2')!.data.readAt).toBe(NOW);
      expect(entries.get('shelf-3')!.data.addedAt).toBe(earlier);
      expect(entries.get('shelf-4')!.data.addedAt).toBe(NOW);
    });

    it("fails when the pending books are named but can't be read", async () => {
      // Arrange
      save();
      stubGoodreads({});
      const { ctx } = context();

      // Act
      const result = refresh(['shelf'], ctx, join(dir, 'missing.json'));

      // Assert
      await expect(result).rejects.toThrow('ENOENT');
    });

    it('saves the schema-checked books in id order', async () => {
      // Arrange
      save(book('shelf', '2', 0));
      stubGoodreads({ shelf: [entry({ id: '3' }), entry({ id: '1' }), entry({ id: '2' })] });
      const { entries, ctx } = context();

      // Act
      await refresh(['shelf'], ctx);

      // Assert
      expect(savedNow().map(({ id }) => id)).toEqual(['shelf-1', 'shelf-2', 'shelf-3']);
      expect(savedNow()).toEqual(expect.arrayContaining(JSON.parse(JSON.stringify([...entries.values()]))));
    });

    it("leaves the saved file alone when the books haven't changed", async () => {
      // Arrange
      save(book('shelf', '1', 0), book('shelf', '2', 1));
      utimesSync(saved, 0, 0);
      stubGoodreads({ shelf: [entry({ id: '2' }), entry({ id: '1' })] });

      // Act
      await refresh(['shelf'], context().ctx);

      // Assert
      expect(statSync(saved).mtimeMs).toBe(0);
    });

    it('fails when the answer holds no book list, without touching the store or the file', async () => {
      // Arrange
      save(book('favorites', '1', 0));
      utimesSync(saved, 0, 0);
      stubResponses(() => new Response('<html>Sign in</html>'));
      const { store, ctx } = context();

      // Act
      const result = refresh(['favorites'], ctx);

      // Assert
      await expect(result).rejects.toThrow('Goodreads favorites: the widget holds no book list');
      expect(store.clear).not.toHaveBeenCalled();
      expect(statSync(saved).mtimeMs).toBe(0);
    });

    it.each([
      ['another shelf', widget('currently-reading', entry({})), 'the widget lists currently-reading'],
      ['no shelf', "var widget_code = '<h2>Books<\\/h2>'", 'the widget lists no shelf'],
    ])('fails when the widget lists %s, as a cached one can', async (_, script, message) => {
      // Arrange
      save(book('favorites', '1', 0));
      stubResponses(() => new Response(script));
      const { ctx } = context();

      // Act
      const result = refresh(['favorites'], ctx);

      // Assert
      await expect(result).rejects.toThrow(`Goodreads favorites: ${message}`);
    });

    it('fails when Goodreads keeps erroring after two retries', async () => {
      // Arrange
      save();
      const fetch = stubGoodreads({}, 503);
      const { store, logger, ctx } = context();

      // Act
      const result = refresh(['favorites'], ctx);

      // Assert
      await expect(result).rejects.toThrow('Goodreads favorites: HTTP 503');
      expect(fetch).toHaveBeenCalledTimes(3);
      expect(logger.warn).toHaveBeenCalledWith('Goodreads favorites: HTTP 503, retrying (1 of 2)');
      expect(store.clear).not.toHaveBeenCalled();
    });

    it('retries a brief 5xx and merges the shelf once Goodreads answers', async () => {
      // Arrange
      save();
      const fetch = stubResponses(
        () => new Response('', { status: 502 }),
        () => new Response(widget('favorites', entry({ id: '7' }))),
      );
      const { entries, ctx } = context();

      // Act
      await refresh(['favorites'], ctx);

      // Assert
      expect(fetch).toHaveBeenCalledTimes(2);
      expect([...entries.keys()]).toEqual(['favorites-7']);
    });

    it('retries a network error', async () => {
      // Arrange
      save();
      const fetch = stubResponses(
        () => Promise.reject(new TypeError('fetch failed')),
        () => new Response(widget('favorites')),
      );
      const { logger, ctx } = context();

      // Act
      await refresh(['favorites'], ctx);

      // Assert
      expect(fetch).toHaveBeenCalledTimes(2);
      expect(logger.warn).toHaveBeenCalledWith('Goodreads favorites: TypeError: fetch failed, retrying (1 of 2)');
    });

    it('fails on a network error that outlasts the retries', async () => {
      // Arrange
      save();
      const fetch = stubResponses(() => Promise.reject(new TypeError('fetch failed')));
      const { ctx } = context();

      // Act
      const result = refresh(['favorites'], ctx);

      // Assert
      await expect(result).rejects.toThrow('fetch failed');
      expect(fetch).toHaveBeenCalledTimes(3);
    });

    it("doesn't retry an error that won't go away, such as a 404", async () => {
      // Arrange
      save();
      const fetch = stubGoodreads({}, 404);
      const { logger, ctx } = context();

      // Act
      const result = refresh(['favorites'], ctx);

      // Assert
      await expect(result).rejects.toThrow('Goodreads favorites: HTTP 404');
      expect(fetch).toHaveBeenCalledTimes(1);
      expect(logger.warn).not.toHaveBeenCalled();
    });

    it('waits 0.3s, then 0.6s, between retries', async () => {
      // Arrange
      save();
      const fetch = stubGoodreads({}, 500);
      const { ctx } = context();

      // Act
      const result = load(['favorites'], ctx, true);
      result.catch(() => {});
      await firstRequest(fetch);
      await vi.advanceTimersByTimeAsync(299);
      const beforeFirstWait = fetch.mock.calls.length;
      await vi.advanceTimersByTimeAsync(1);
      const afterFirstWait = fetch.mock.calls.length;
      await vi.advanceTimersByTimeAsync(599);
      const beforeSecondWait = fetch.mock.calls.length;
      await vi.advanceTimersByTimeAsync(1);

      // Assert
      expect([beforeFirstWait, afterFirstWait, beforeSecondWait, fetch.mock.calls.length]).toEqual([1, 2, 2, 3]);
      await expect(result).rejects.toThrow('HTTP 500');
    });

    it("waits as long as a 503 or 429's Retry-After says, up to 10s", async () => {
      // Arrange
      save();
      const fetch = stubResponses(
        () => new Response('', { status: 429, headers: { 'Retry-After': '2' } }),
        () => new Response('', { status: 503, headers: { 'Retry-After': '3600' } }),
        () => new Response(widget('favorites')),
      );
      const { ctx } = context();

      // Act
      const result = load(['favorites'], ctx, true);
      await firstRequest(fetch);
      await vi.advanceTimersByTimeAsync(1999);
      const beforeRetryAfter = fetch.mock.calls.length;
      await vi.advanceTimersByTimeAsync(1);
      const afterRetryAfter = fetch.mock.calls.length;
      await vi.advanceTimersByTimeAsync(9999);
      const beforeCap = fetch.mock.calls.length;
      await vi.advanceTimersByTimeAsync(1);
      await result;

      // Assert
      expect([beforeRetryAfter, afterRetryAfter, beforeCap, fetch.mock.calls.length]).toEqual([1, 2, 2, 3]);
    });
  });
});
