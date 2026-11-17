/**
 * The content loader behind `/reading/`.
 *
 * @remarks
 * Goodreads closed its API in 2020 and retired its shelf RSS feeds in 2026. The shelf widget
 * is still public: a script that lists a shelf's 100 most recently added books.
 * So the books live in `src/content/books.json`, and every build reads only that file. A
 * daily workflow sets `refresh`: the loader then reads each shelf's widget, merges it into
 * the file, and the workflow proposes the change in a pull request.
 *
 * @packageDocumentation
 * @file goodreads.ts
 * @author Jimmy Kurian
 * @copyright Copyright (c) 2026 Jimmy Kurian. All rights reserved. See LICENSE.
 */
import { readFile, writeFile } from 'node:fs/promises';
import type { AstroIntegrationLogger } from 'astro';
import type { Loader } from 'astro/loaders';

// The most books a widget lists. A shelf that fills it may hold more.
const WIDGET_LIMIT = 100;

// Goodreads now and then answers with a brief 5xx. Retry those, rate limits and network
// errors twice (0.3s, then 0.6s, or the server's Retry-After up to 10s) before failing.
const RETRIES = 2;
const RETRY_STATUSES = new Set([408, 429, 500, 502, 503, 504]);
const MAX_RETRY_AFTER_MS = 10_000;

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

function retryDelay(res: Response | undefined, attempt: number) {
  const retryAfter = Number(res?.headers.get('Retry-After'));
  if ((res?.status === 429 || res?.status === 503) && retryAfter > 0) {
    return Math.min(retryAfter * 1000, MAX_RETRY_AFTER_MS);
  }
  return 300 * 2 ** attempt;
}

async function fetchFeed(url: string, label: string, logger: AstroIntegrationLogger) {
  for (let attempt = 0; ; attempt++) {
    let res: Response | undefined;
    let problem: string;
    try {
      res = await fetch(url, { headers: { 'User-Agent': 'jimmykurian.me build' } });
      if (res.ok || !RETRY_STATUSES.has(res.status) || attempt === RETRIES) return res;
      problem = `HTTP ${res.status}`;
    } catch (error) {
      if (attempt === RETRIES) throw error;
      problem = String(error);
    }
    logger.warn(`${label}: ${problem}, retrying (${attempt + 1} of ${RETRIES})`);
    await wait(retryDelay(res, attempt));
  }
}

const entities: Record<string, string> = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'" };
const decode = (s: string) =>
  s.replace(/&(#x?[0-9a-f]+|\w+);/gi, (m, e: string) =>
    e[0] === '#'
      ? String.fromCodePoint(parseInt(e.slice(1).replace(/^x/i, ''), e[1].toLowerCase() === 'x' ? 16 : 10))
      : (entities[e] ?? m),
  );

// "Title: Subtitle (Series, #2)" becomes { title, subtitle } without the series.
const splitTitle = (raw: string) => {
  const [title, ...rest] = raw.replace(/\s*\([^()]*\)$/, '').split(': ');
  return { title, subtitle: rest.join(': ') || undefined };
};

type Book = { id: string; data: Record<string, unknown> };

/** What a widget says about one book. `rating` is undefined when it shows no rating of Jimmy's. */
type Listed = {
  bookId: string;
  title: string;
  author: string;
  rating: number | undefined;
  toRead: boolean;
  cover: string;
};

/** The first group `pattern` captures in `html`, or an empty string. */
const capture = (pattern: RegExp, html: string) => pattern.exec(html)?.[1] ?? '';

/** One widget entry as a book, or its title alone when it has no cover to take the id from. */
function parseEntry(entry: string): Listed | string {
  const title = decode(capture(/<a title="([^"]*)"/, entry));
  const cover = capture(/<img alt="[^"]*" border="0" src="([^"]*)"/, entry);
  const bookId = capture(/\/books\/\d+[a-z]\/(\d+)\./, cover);
  if (!bookId) return title;
  // The author and the tags are read as plain text, up to the next tag.
  const tags = capture(/tagged:([^<]*)/, entry)
    .trim()
    .split(/,\s*|\s+and\s+/);
  return {
    bookId,
    title,
    author: decode(capture(/<div class="gr_custom_author_[^>]*>\s*by\s*(?:<a [^>]*>)?([^<]*)/, entry).trim()),
    // A part-filled star is the book's average rating, shown when Jimmy hasn't rated it.
    rating: /star_\d+pct/.test(entry) ? undefined : entry.split('star_active').length - 1,
    toRead: tags.includes('to-read'),
    // Without the size suffix (._SX98_), the address is the full-size cover.
    cover: cover.replace(/\._S[XY]\d+(?:_S[XY]\d+)?_(?=\.\w+$)/, ''),
  };
}

/**
 * The books in a widget script, newest first, and whether they're the whole shelf.
 *
 * @remarks
 * The script holds the widget's HTML in one string, `widget_code`. A book's id appears only
 * in its cover's address, so a book without a cover is skipped, with a warning. A skipped
 * book still counts toward {@link WIDGET_LIMIT}: a widget with that many entries may be cut
 * short, however many of them could be read.
 */
function parseWidget(script: string, shelf: string, logger: AstroIntegrationLogger) {
  const code = /var widget_code = '((?:[^'\\]|\\.)*)'/.exec(script)?.[1];
  if (code === undefined) throw new Error(`Goodreads ${shelf}: the widget holds no book list`);
  const html = code.replace(/\\(.)/g, (_, c: string) => (c === 'n' ? '\n' : c));
  // Goodreads caches a widget by its id, so check that this list is the shelf asked for.
  const listed = capture(/\/review\/list\/[^"]*?[?&;]shelf=([^"&]*)/, html);
  if (listed !== shelf) throw new Error(`Goodreads ${shelf}: the widget lists ${listed || 'no shelf'}`);

  const books: Listed[] = [];
  const entries = html.split(/<div class="gr_custom_each_container_/).slice(1);
  for (const entry of entries) {
    const book = parseEntry(entry);
    if (typeof book === 'string') {
      logger.warn(`${shelf}: skipped "${book}", which has no cover to take its book id from`);
    } else {
      books.push(book);
    }
  }
  return { books, whole: entries.length < WIDGET_LIMIT };
}

async function fetchShelf(userId: string, shelf: string, widgetId: number, logger: AstroIntegrationLogger) {
  const query = new URLSearchParams({
    shelf,
    num_books: String(WIDGET_LIMIT),
    sort: 'date_added',
    order: 'd',
    show_author: '1',
    show_cover: '1',
    show_rating: '1',
    show_tags: '1',
    show_title: '1',
    widget_id: String(widgetId),
  });
  const url = `https://www.goodreads.com/review/custom_widget/${userId}?${query}`;
  const res = await fetchFeed(url, `Goodreads ${shelf}`, logger);
  if (!res.ok) throw new Error(`Goodreads ${shelf}: HTTP ${res.status}`);
  return parseWidget(await res.text(), shelf, logger);
}

/**
 * One shelf's saved books, brought up to date with its widget.
 *
 * @remarks
 * New books go first, newest first, dated now; the saved books follow in their saved order.
 * A saved book takes the widget's rating and to-read mark, and is dated as read the day its
 * to-read mark goes. Either date comes from `pending` instead when an earlier, unmerged
 * refresh already set it, so it records the first day the change was seen. When the widget
 * is the `whole` shelf, saved books it lacks are dropped. Otherwise nothing is dropped.
 */
function mergeShelf(
  shelf: string,
  savedBooks: Book[],
  { books: listed, whole }: { books: Listed[]; whole: boolean },
  { now, pending }: { now: string; pending: Map<string, Book['data']> },
): Book[] {
  const known = new Map(savedBooks.map((book) => [book.id, book]));
  const seen = new Map<string, Listed>();
  const added: Book[] = [];
  for (const book of listed) {
    const id = `${shelf}-${book.bookId}`;
    seen.set(id, book);
    if (known.has(id)) continue;
    added.push({
      id,
      data: {
        shelf,
        ...splitTitle(book.title),
        author: book.author,
        rating: book.rating ?? 0,
        toRead: book.toRead,
        readAt: null,
        addedAt: pending.get(id)?.addedAt ?? now,
        cover: book.cover,
        href: `https://www.goodreads.com/book/show/${book.bookId}`,
      },
    });
  }
  const kept = savedBooks
    .filter(({ id }) => !whole || seen.has(id))
    .map(({ id, data }) => {
      const book = seen.get(id);
      if (!book) return { id, data };
      const finished = data.toRead === true && !book.toRead && !data.readAt;
      return {
        id,
        data: {
          ...data,
          rating: book.rating ?? data.rating,
          toRead: book.toRead,
          readAt: finished ? (pending.get(id)?.readAt ?? now) : data.readAt,
        },
      };
    });
  return [...added, ...kept].map(({ id, data }, position) => ({ id, data: { ...data, position } }));
}

async function refreshBooks(
  { userId, shelves }: { userId: string; shelves: string[] },
  savedBooks: Book[],
  pendingBooks: Book[],
  logger: AstroIntegrationLogger,
) {
  const now = new Date();
  const dates = { now: now.toISOString(), pending: new Map(pendingBooks.map(({ id, data }) => [id, data])) };
  // A widget id nobody has asked for before, so Goodreads answers with the shelf as it is now.
  const firstWidgetId = Math.floor(now.getTime() / 1000);
  const books: Book[] = [];
  for (const [index, shelf] of shelves.entries()) {
    const listed = await fetchShelf(userId, shelf, firstWidgetId + index, logger);
    const onShelf = savedBooks.filter(({ data }) => data.shelf === shelf);
    onShelf.sort((a, b) => Number(a.data.position) - Number(b.data.position));
    const merged = mergeShelf(shelf, onShelf, listed, dates);
    logger.info(`${shelf}: ${listed.books.length} books read, ${merged.length} saved`);
    books.push(...merged);
  }
  return books;
}

/**
 * An Astro content loader with one entry per book per shelf, read from the saved books.
 *
 * @remarks
 * A build loads the books in `saved` and never calls Goodreads. With `refresh`, the loader
 * first reads each shelf's widget (retried twice on a brief 5xx, rate limit or network
 * error), merges it into the saved books and writes the schema-checked result back to
 * `saved`, if it changed. Loading throws, which fails the run and leaves the store and the
 * file unchanged, when `saved` can't be read or, with `refresh`, a shelf can't be.
 *
 * @param options - `userId` is the public Goodreads profile; `shelves` are the shelf names to
 * refresh; `saved` is the JSON file holding the books; `refresh` reads Goodreads first, for
 * the workflow that keeps `saved` up to date; `pending` is a copy of `saved` from that
 * workflow's open pull request, if there is one, whose first-seen dates a refresh keeps.
 * @returns The loader, named `goodreads`.
 *
 * @example
 * ```ts
 * const books = defineCollection({
 *   loader: goodreadsLoader({ userId: '52431533', shelves: ['favorites'], saved: 'src/content/books.json' }),
 * });
 * ```
 */
export function goodreadsLoader({
  userId,
  shelves,
  saved,
  refresh = false,
  pending,
}: {
  userId: string;
  shelves: string[];
  saved: string;
  refresh?: boolean;
  pending?: string;
}): Loader {
  return {
    name: 'goodreads',
    load: async ({ store, logger, parseData }) => {
      const before = await readFile(saved, 'utf8');
      let books = JSON.parse(before) as Book[];
      if (refresh) {
        const pendingBooks = pending ? (JSON.parse(await readFile(pending, 'utf8')) as Book[]) : [];
        books = await refreshBooks({ userId, shelves }, books, pendingBooks, logger);
      }
      const parsed = [];
      for (const { id, data } of books) parsed.push({ id, data: await parseData({ id, data }) });
      store.clear();
      for (const book of parsed) store.set(book);
      if (refresh) {
        // In id order, so a refresh changes only the lines of the books that changed.
        parsed.sort((a, b) => (a.id < b.id ? -1 : 1));
        const json = `${JSON.stringify(parsed, null, 2)}\n`;
        if (json !== before) await writeFile(saved, json);
      }
    },
  };
}
