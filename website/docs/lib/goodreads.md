[**jimmykurian.me website**](../README.md)

***

[jimmykurian.me website](../README.md) / lib/goodreads

# lib/goodreads

The content loader behind `/reading/`.

## Remarks

Goodreads closed its API in 2020, but each shelf of a public profile still has an RSS
feed. This loader reads those feeds at build time; the nightly CI build keeps it fresh.
Each successful read is saved to `src/content/books.json`, and a daily workflow proposes
that file in a pull request. If Goodreads can't be read, the build uses the saved books,
so a Goodreads outage never blocks a deploy or ships an empty reading list.

## Functions

### goodreadsLoader()

```ts
function goodreadsLoader(options): Loader;
```

Defined in: [src/lib/goodreads.ts:148](https://github.com/jimmykurian/personal-site/blob/main/website/src/lib/goodreads.ts#L148)

An Astro content loader with one entry per book per shelf, read from the shelves' RSS feeds.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `options` | \{ `userId`: `string`; `shelves`: `string`[]; `saved`: `string`; `strict?`: `boolean`; \} | `userId` is the public Goodreads profile; `shelves` are the shelf names to read; `saved` is the JSON file holding the last books read; `strict` turns off the fallback, for the workflow that refreshes `saved`. |
| `options.userId` | `string` | - |
| `options.shelves` | `string`[] | - |
| `options.saved` | `string` | - |
| `options.strict?` | `boolean` | - |

#### Returns

`Loader`

The loader, named `goodreads`.

#### Remarks

Each feed page is retried twice on a brief 5xx, rate limit or network error. After a full
read, the schema-checked books are written to `saved`. If a shelf still can't be read, the
books in `saved` are loaded instead, with a warning. Loading throws, which fails the build
and leaves the store unchanged, only when there's no saved file or `strict` is set.

#### Example

```ts
const books = defineCollection({
  loader: goodreadsLoader({ userId: '52431533', shelves: ['favorites'], saved: 'src/content/books.json' }),
});
```
