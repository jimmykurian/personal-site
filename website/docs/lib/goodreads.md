[**jimmykurian.me website**](../README.md)

***

[jimmykurian.me website](../README.md) / lib/goodreads

# lib/goodreads

The content loader behind `/reading/`.

## Remarks

Goodreads closed its API in 2020, but each shelf of a public profile still has an RSS
feed. This loader reads those feeds at build time; the nightly CI build keeps it fresh.
If Goodreads is unreachable the build fails on purpose, so the last deploy stays live
instead of shipping an empty reading list.

## Functions

### goodreadsLoader()

```ts
function goodreadsLoader(options): Loader;
```

Defined in: [src/lib/goodreads.ts:102](https://github.com/jimmykurian/personal-site/blob/main/website/src/lib/goodreads.ts#L102)

An Astro content loader with one entry per book per shelf, read from the shelves' RSS feeds.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `options` | \{ `userId`: `string`; `shelves`: `string`[]; \} | `userId` is the public Goodreads profile; `shelves` are the shelf names to read. |
| `options.userId` | `string` | - |
| `options.shelves` | `string`[] | - |

#### Returns

`Loader`

The loader, named `goodreads`.

#### Remarks

Each feed page is retried twice on a brief 5xx, rate limit or network error. If a shelf
still can't be read, loading throws, which fails the build and leaves the store unchanged.

#### Example

```ts
const books = defineCollection({
  loader: goodreadsLoader({ userId: '52431533', shelves: ['favorites'] }),
});
```
