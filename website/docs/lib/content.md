[**jimmykurian.me website**](../README.md)

***

[jimmykurian.me website](../README.md) / lib/content

# lib/content

Reads the JSON content collections in the order their files list them.

## Functions

### getOrdered()

```ts
function getOrdered<C>(collection): Promise<CollectionEntry<C>[]>;
```

Defined in: [src/lib/content.ts:28](https://github.com/jimmykurian/personal-site/blob/main/website/src/lib/content.ts#L28)

Every entry of a JSON collection, in the order its source file lists them.

#### Type Parameters

| Type Parameter |
| ------ |
| <a id="type-parameter-c"></a> `C` *extends* `"teaching"` \| `"experience"` \| `"projects"` \| `"writing"` |

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `collection` | `C` | The collection to read: `experience`, `projects`, `teaching` or `writing`. |

#### Returns

`Promise`\<`CollectionEntry`\<`C`\>[]\>

The collection's entries, in file order.
