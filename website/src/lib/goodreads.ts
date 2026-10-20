import type { AstroIntegrationLogger } from 'astro';
import type { Loader } from 'astro/loaders';

// Goodreads closed its API in 2020, but each shelf of a public profile still has an RSS
// feed. This loader reads those feeds at build time; the nightly CI build keeps it fresh.
// If Goodreads is unreachable the build fails on purpose, so the last deploy stays live
// instead of shipping an empty reading list.

const PAGE_LIMIT = 20; // 100 books per page

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

const field = (item: string, tag: string) => {
  const m = item.match(new RegExp(`<${tag}>\\s*(?:<!\\[CDATA\\[)?([\\s\\S]*?)(?:\\]\\]>)?\\s*</${tag}>`));
  return m ? decode(m[1].trim()) : '';
};

// "Title: Subtitle (Series, #2)" becomes { title, subtitle } without the series.
const splitTitle = (raw: string) => {
  const [title, ...rest] = raw.replace(/\s*\([^()]*\)$/, '').split(': ');
  return { title, subtitle: rest.join(': ') || undefined };
};

async function fetchShelf(userId: string, shelf: string, logger: AstroIntegrationLogger) {
  const items: string[] = [];
  for (let page = 1; page <= PAGE_LIMIT; page++) {
    const url = `https://www.goodreads.com/review/list_rss/${userId}?shelf=${shelf}&page=${page}`;
    const res = await fetchFeed(url, `Goodreads ${shelf} page ${page}`, logger);
    if (!res.ok) throw new Error(`Goodreads ${shelf} page ${page}: HTTP ${res.status}`);
    const batch = (await res.text()).match(/<item>[\s\S]*?<\/item>/g) ?? [];
    if (batch.length === 0) break;
    items.push(...batch);
  }
  return items;
}

export function goodreadsLoader({ userId, shelves }: { userId: string; shelves: string[] }): Loader {
  return {
    name: 'goodreads',
    load: async ({ store, logger, parseData }) => {
      const books = [];
      for (const shelf of shelves) {
        const items = await fetchShelf(userId, shelf, logger);
        logger.info(`${shelf}: ${items.length} books`);
        for (const [position, item] of items.entries()) {
          const id = `${shelf}-${field(item, 'book_id')}`;
          const cover = field(item, 'book_large_image_url');
          books.push({
            id,
            data: {
              shelf,
              position,
              ...splitTitle(field(item, 'title')),
              author: field(item, 'author_name'),
              rating: Number(field(item, 'user_rating')) || 0,
              toRead: field(item, 'user_shelves').split(/,\s*/).includes('to-read'),
              readAt: field(item, 'user_read_at') || null,
              addedAt: field(item, 'user_date_added'),
              cover: cover && !cover.includes('nophoto') ? cover : undefined,
              href: `https://www.goodreads.com/book/show/${field(item, 'book_id')}`,
            },
          });
        }
      }
      store.clear();
      for (const { id, data } of books) store.set({ id, data: await parseData({ id, data }) });
    },
  };
}
