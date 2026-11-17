[**jimmykurian.me website**](../README.md)

***

[jimmykurian.me website](../README.md) / lib/goodreads

# lib/goodreads

The content loader behind `/reading/`.

## Remarks

Goodreads closed its API in 2020 and retired its shelf RSS feeds in 2026. The shelf widget
is still public: a script that lists a shelf's 100 most recently added books.
So the books live in `src/content/books.json`, and every build reads only that file. A
daily workflow sets `refresh`: the loader then reads each shelf's widget, merges it into
the file, and the workflow proposes the change in a pull request.

## Functions

### goodreadsLoader()

```ts
function goodreadsLoader(options): Loader;
```

Defined in: [src/lib/goodreads.ts:258](https://github.com/jimmykurian/personal-site/blob/main/website/src/lib/goodreads.ts#L258)

An Astro content loader with one entry per book per shelf, read from the saved books.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `options` | \{ `userId`: `string`; `shelves`: `string`[]; `saved`: `string`; `refresh?`: `boolean`; `pending?`: `string`; \} | `userId` is the public Goodreads profile; `shelves` are the shelf names to refresh; `saved` is the JSON file holding the books; `refresh` reads Goodreads first, for the workflow that keeps `saved` up to date; `pending` is a copy of `saved` from that workflow's open pull request, if there is one, whose first-seen dates a refresh keeps. |
| `options.userId` | `string` | - |
| `options.shelves` | `string`[] | - |
| `options.saved` | `string` | - |
| `options.refresh?` | `boolean` | - |
| `options.pending?` | `string` | - |

#### Returns

`Loader`

The loader, named `goodreads`.

#### Remarks

A build loads the books in `saved` and never calls Goodreads. With `refresh`, the loader
first reads each shelf's widget (retried twice on a brief 5xx, rate limit or network
error), merges it into the saved books and writes the schema-checked result back to
`saved`, if it changed. Loading throws, which fails the run and leaves the store and the
file unchanged, when `saved` can't be read or, with `refresh`, a shelf can't be.

#### Example

```ts
const books = defineCollection({
  loader: goodreadsLoader({ userId: '52431533', shelves: ['favorites'], saved: 'src/content/books.json' }),
});
```
