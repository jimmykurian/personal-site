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

/** Runs a load with fake timers, so retry waits pass instantly. */
async function loadWithTimers(shelves: string[], ctx: never, strict = false) {
  vi.useFakeTimers({ toFake: ['setTimeout'] });
  const result = load(shelves, ctx, strict);
  result.catch(() => {});
  await vi.runAllTimersAsync();
  return result;
}

const load = (shelves: string[], ctx: never, strict = false) =>
  goodreadsLoader({ userId: '52431533', shelves, saved, strict }).load(ctx);

const savedBooks = [{ id: 'favorites-5', data: { shelf: 'favorites', position: 0, title: 'Saved' } }];

describe('goodreadsLoader', () => {
  beforeEach(() => {
    dir = mkdtempSync(join(tmpdir(), 'goodreads-'));
    saved = join(dir, 'books.json');
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

  it('fails the build when Goodreads keeps erroring after two retries, without touching the store', async () => {
    // Arrange
    const fetch = stubGoodreads({}, 503);
    const { store, logger, ctx } = context();

    // Act
    const result = loadWithTimers(['favorites'], ctx);

    // Assert
    await expect(result).rejects.toThrow('Goodreads favorites page 1: HTTP 503');
    expect(fetch).toHaveBeenCalledTimes(3);
    expect(logger.warn).toHaveBeenCalledWith('Goodreads favorites page 1: HTTP 503, retrying (1 of 2)');
    expect(store.clear).not.toHaveBeenCalled();
  });

  it('retries a brief 5xx and loads the shelf once Goodreads answers', async () => {
    // Arrange
    const ok = () => new Response(feed(item({ book_id: '7' })));
    const fetch = stubResponses(
      () => new Response('', { status: 502 }),
      ok,
      () => new Response(feed()),
    );
    const { entries, ctx } = context();

    // Act
    await loadWithTimers(['favorites'], ctx);

    // Assert
    expect(fetch).toHaveBeenCalledTimes(3);
    expect([...entries.keys()]).toEqual(['favorites-7']);
  });

  it('retries a network error', async () => {
    // Arrange
    const fetch = stubResponses(
      () => Promise.reject(new TypeError('fetch failed')),
      () => new Response(feed()),
    );
    const { logger, ctx } = context();

    // Act
    await loadWithTimers(['favorites'], ctx);

    // Assert
    expect(fetch).toHaveBeenCalledTimes(2);
    expect(logger.warn).toHaveBeenCalledWith('Goodreads favorites page 1: TypeError: fetch failed, retrying (1 of 2)');
  });

  it('fails on a network error that outlasts the retries', async () => {
    // Arrange
    const fetch = stubResponses(() => Promise.reject(new TypeError('fetch failed')));
    const { ctx } = context();

    // Act
    const result = loadWithTimers(['favorites'], ctx);

    // Assert
    await expect(result).rejects.toThrow('fetch failed');
    expect(fetch).toHaveBeenCalledTimes(3);
  });

  it("doesn't retry an error that won't go away, such as a 404", async () => {
    // Arrange
    const fetch = stubGoodreads({}, 404);
    const { logger, ctx } = context();

    // Act
    const result = loadWithTimers(['favorites'], ctx);

    // Assert
    await expect(result).rejects.toThrow('Goodreads favorites page 1: HTTP 404');
    expect(fetch).toHaveBeenCalledTimes(1);
    expect(logger.warn).not.toHaveBeenCalled();
  });

  it('waits 0.3s, then 0.6s, between retries', async () => {
    // Arrange
    vi.useFakeTimers({ toFake: ['setTimeout'] });
    const fetch = stubGoodreads({}, 500);
    const { ctx } = context();

    // Act
    const result = load(['favorites'], ctx);
    result.catch(() => {});
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
    vi.useFakeTimers({ toFake: ['setTimeout'] });
    const fetch = stubResponses(
      () => new Response('', { status: 429, headers: { 'Retry-After': '2' } }),
      () => new Response('', { status: 503, headers: { 'Retry-After': '3600' } }),
      () => new Response(feed()),
    );
    const { ctx } = context();

    // Act
    const result = load(['favorites'], ctx);
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

  it('saves the schema-checked books after a full read', async () => {
    // Arrange
    stubGoodreads({ shelf: [[item({ book_id: '1' })]] });
    const { entries, ctx } = context();

    // Act
    await load(['shelf'], ctx);

    // Assert
    expect(JSON.parse(readFileSync(saved, 'utf8'))).toEqual([...entries.values()]);
  });

  it("leaves the saved file alone when the books haven't changed", async () => {
    // Arrange
    stubGoodreads({ shelf: [[item({ book_id: '1' })]] });
    await load(['shelf'], context().ctx);
    utimesSync(saved, 0, 0);

    // Act
    await load(['shelf'], context().ctx);

    // Assert
    expect(statSync(saved).mtimeMs).toBe(0);
  });

  it("loads the saved books, with a warning, when Goodreads can't be read", async () => {
    // Arrange
    writeFileSync(saved, JSON.stringify(savedBooks));
    stubGoodreads({}, 404);
    const { entries, logger, ctx } = context();

    // Act
    await loadWithTimers(['favorites'], ctx);

    // Assert
    expect([...entries.values()]).toEqual(savedBooks);
    expect(logger.warn).toHaveBeenCalledWith(
      `Error: Goodreads favorites page 1: HTTP 404; using the 1 books saved in ${saved}`,
    );
    expect(JSON.parse(readFileSync(saved, 'utf8'))).toEqual(savedBooks);
  });

  it('fails instead of using the saved books when strict, as the refresh workflow is', async () => {
    // Arrange
    writeFileSync(saved, JSON.stringify(savedBooks));
    stubGoodreads({}, 404);
    const { store, ctx } = context();

    // Act
    const result = loadWithTimers(['favorites'], ctx, true);

    // Assert
    await expect(result).rejects.toThrow('Goodreads favorites page 1: HTTP 404');
    expect(store.clear).not.toHaveBeenCalled();
  });

  it("fails when the saved books can't be read either", async () => {
    // Arrange
    saved = dir;
    stubGoodreads({}, 404);
    const { ctx } = context();

    // Act
    const result = loadWithTimers(['favorites'], ctx);

    // Assert
    await expect(result).rejects.toThrow('EISDIR');
  });
});
