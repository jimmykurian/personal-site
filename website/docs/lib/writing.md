[**jimmykurian.me website**](../README.md)

***

[jimmykurian.me website](../README.md) / lib/writing

# lib/writing

Publications, patents and talks, and the labels they show with.

## Type Aliases

### WritingItem

```ts
type WritingItem = CollectionEntry<"writing">;
```

Defined in: [src/lib/writing.ts:13](https://github.com/jimmykurian/personal-site/blob/main/website/src/lib/writing.ts#L13)

A publication, patent or talk from `src/content/writing.json`.

## Functions

### getWriting()

```ts
function getWriting(): Promise<object[]>;
```

Defined in: [src/lib/writing.ts:27](https://github.com/jimmykurian/personal-site/blob/main/website/src/lib/writing.ts#L27)

Every writing entry, newest first: the order of `src/content/writing.json`.

#### Returns

`Promise`\<`object`[]\>

The writing entries, in file order.

***

### featuredLabel()

```ts
function featuredLabel(item): string;
```

Defined in: [src/lib/writing.ts:38](https://github.com/jimmykurian/personal-site/blob/main/website/src/lib/writing.ts#L38)

The label a featured entry shows with on the home page.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `item` | \{ `id`: `string`; `body?`: `string`; `collection`: `"writing"`; `data`: \{ `kind`: `"article"` \| `"patent"` \| `"talk"` \| `"chapter"`; `title`: `string`; `venue`: `string`; `year?`: `number`; `format?`: `string`; `href?`: `string`; `featured`: `boolean`; `featuredNote?`: `string`; \}; `rendered?`: `RenderedContent`; `filePath?`: `string`; `digest?`: `string` \| `number`; \} | The writing entry. |
| `item.id` | `string` | - |
| `item.body?` | `string` | - |
| `item.collection` | `"writing"` | - |
| `item.data` | \{ `kind`: `"article"` \| `"patent"` \| `"talk"` \| `"chapter"`; `title`: `string`; `venue`: `string`; `year?`: `number`; `format?`: `string`; `href?`: `string`; `featured`: `boolean`; `featuredNote?`: `string`; \} | - |
| `item.data.kind?` | `"article"` \| `"patent"` \| `"talk"` \| `"chapter"` | - |
| `item.data.title?` | `string` | - |
| `item.data.venue?` | `string` | - |
| `item.data.year?` | `number` | - |
| `item.data.format?` | `string` | - |
| `item.data.href?` | `string` | - |
| `item.data.featured?` | `boolean` | - |
| `item.data.featuredNote?` | `string` | - |
| `item.rendered?` | `RenderedContent` | - |
| `item.filePath?` | `string` | - |
| `item.digest?` | `string` \| `number` | - |

#### Returns

`string`

The year and kind, such as "2026 · Article".

***

### listLabel()

```ts
function listLabel(item): string;
```

Defined in: [src/lib/writing.ts:48](https://github.com/jimmykurian/personal-site/blob/main/website/src/lib/writing.ts#L48)

The label an entry shows with on the writing page, where the section heading already names the kind.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `item` | \{ `id`: `string`; `body?`: `string`; `collection`: `"writing"`; `data`: \{ `kind`: `"article"` \| `"patent"` \| `"talk"` \| `"chapter"`; `title`: `string`; `venue`: `string`; `year?`: `number`; `format?`: `string`; `href?`: `string`; `featured`: `boolean`; `featuredNote?`: `string`; \}; `rendered?`: `RenderedContent`; `filePath?`: `string`; `digest?`: `string` \| `number`; \} | The writing entry. |
| `item.id` | `string` | - |
| `item.body?` | `string` | - |
| `item.collection` | `"writing"` | - |
| `item.data` | \{ `kind`: `"article"` \| `"patent"` \| `"talk"` \| `"chapter"`; `title`: `string`; `venue`: `string`; `year?`: `number`; `format?`: `string`; `href?`: `string`; `featured`: `boolean`; `featuredNote?`: `string`; \} | - |
| `item.data.kind?` | `"article"` \| `"patent"` \| `"talk"` \| `"chapter"` | - |
| `item.data.title?` | `string` | - |
| `item.data.venue?` | `string` | - |
| `item.data.year?` | `number` | - |
| `item.data.format?` | `string` | - |
| `item.data.href?` | `string` | - |
| `item.data.featured?` | `boolean` | - |
| `item.data.featuredNote?` | `string` | - |
| `item.rendered?` | `RenderedContent` | - |
| `item.filePath?` | `string` | - |
| `item.digest?` | `string` \| `number` | - |

#### Returns

`string`

The year, for articles and chapters; otherwise the year and format, such as "2026 · Filed" or "Panel".
