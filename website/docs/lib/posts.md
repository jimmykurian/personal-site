[**jimmykurian.me website**](../README.md)

***

[jimmykurian.me website](../README.md) / lib/posts

# lib/posts

The blog posts: which ones are published, how long they take to read, and how their dates show.

## Type Aliases

### Post

```ts
type Post = CollectionEntry<"posts">;
```

Defined in: [src/lib/posts.ts:12](https://github.com/jimmykurian/personal-site/blob/main/website/src/lib/posts.ts#L12)

A blog post, an MDX file in `src/content/posts/`.

## Functions

### getPosts()

```ts
function getPosts(): Promise<object[]>;
```

Defined in: [src/lib/posts.ts:15](https://github.com/jimmykurian/personal-site/blob/main/website/src/lib/posts.ts#L15)

Published posts, newest first. Drafts show in `astro dev` and never in a production build.

#### Returns

`Promise`\<`object`[]\>

***

### readingMinutes()

```ts
function readingMinutes(body?): number;
```

Defined in: [src/lib/posts.ts:26](https://github.com/jimmykurian/personal-site/blob/main/website/src/lib/posts.ts#L26)

Estimated minutes to read a post, at 230 words a minute, never less than one.

#### Parameters

| Parameter | Type | Default value | Description |
| ------ | ------ | ------ | ------ |
| `body?` | `string` | `''` | The post's Markdown. Fenced code blocks and MDX comments don't count. |

#### Returns

`number`

Whole minutes, at least 1.

***

### formatDate()

```ts
function formatDate(d): string;
```

Defined in: [src/lib/posts.ts:44](https://github.com/jimmykurian/personal-site/blob/main/website/src/lib/posts.ts#L44)

A post date written out in full.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `d` | `Date` | The date to format. |

#### Returns

`string`

The date as "October 20, 2026".

#### Remarks

Dates are calendar days in frontmatter, so they're formatted in UTC to avoid an off-by-one.
