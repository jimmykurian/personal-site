[**jimmykurian.me website**](../README.md)

***

[jimmykurian.me website](../README.md) / pages/rss.xml

# pages/rss.xml

The RSS feed at `/rss.xml`.

## Functions

### GET()

```ts
function GET(context): Promise<Response>;
```

Defined in: [src/pages/rss.xml.ts:20](https://github.com/jimmykurian/personal-site/blob/main/website/src/pages/rss.xml.ts#L20)

Builds the feed: every published post, newest first, linking back to `/writing/<id>/`.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `context` | `APIContext` | Astro's endpoint context; `site` gives the feed's absolute URLs. |

#### Returns

`Promise`\<`Response`\>

The RSS document.
