[**jimmykurian.me website**](../README.md)

***

[jimmykurian.me website](../README.md) / lib/track

# lib/track

Named events for PostHog: `track()` and the rule that turns a click into an event.

## Type Aliases

### EventProps

```ts
type EventProps = Record<string, string>;
```

Defined in: [src/lib/track.ts:11](https://github.com/jimmykurian/personal-site/blob/main/website/src/lib/track.ts#L11)

An event's properties: only what was clicked, never anything about the visitor.

***

### Capture

```ts
type Capture = (event, props?) => void;
```

Defined in: [src/lib/track.ts:14](https://github.com/jimmykurian/personal-site/blob/main/website/src/lib/track.ts#L14)

Sends one event; set by `observability.ts` once PostHog has loaded.

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `event` | `string` |
| `props?` | [`EventProps`](#eventprops) |

#### Returns

`void`

## Variables

### QUEUE\_LIMIT

```ts
const QUEUE_LIMIT: 20 = 20;
```

Defined in: [src/lib/track.ts:17](https://github.com/jimmykurian/personal-site/blob/main/website/src/lib/track.ts#L17)

Events tracked before PostHog loads are held, up to this many, then sent.

## Functions

### track()

```ts
function track(event, props?): void;
```

Defined in: [src/lib/track.ts:29](https://github.com/jimmykurian/personal-site/blob/main/website/src/lib/track.ts#L29)

Sends an event to PostHog, or holds it until PostHog loads. Without PostHog (a local or
preview build), nothing is ever sent.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `event` | `string` | The event name, such as `resume_pdf_download`. |
| `props?` | [`EventProps`](#eventprops) | What was clicked, such as `{ host: 'github.com' }`. |

#### Returns

`void`

***

### setCapture()

```ts
function setCapture(fn): void;
```

Defined in: [src/lib/track.ts:39](https://github.com/jimmykurian/personal-site/blob/main/website/src/lib/track.ts#L39)

Connects `track()` to PostHog, and sends the events held so far.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `fn` | [`Capture`](#capture) \| `undefined` | Sends one event, or `undefined` to disconnect (used by the tests). |

#### Returns

`void`

***

### eventFor()

```ts
function eventFor(el, origin): 
  | {
  event: string;
  props?: EventProps;
}
  | undefined;
```

Defined in: [src/lib/track.ts:60](https://github.com/jimmykurian/personal-site/blob/main/website/src/lib/track.ts#L60)

The event a click on `el` sends, if any:
- an element with `data-track` sends that event, with its link target
- a `mailto:` link sends `contact_email_click`
- a link to another site sends `outbound_click`, with that site's host

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `el` | `Element` | The clicked link or element. |
| `origin` | `string` | The site's own origin, such as `https://www.jimmykurian.me`. |

#### Returns

  \| \{
  `event`: `string`;
  `props?`: [`EventProps`](#eventprops);
\}
  \| `undefined`

The event name and properties, or `undefined` for a click that isn't tracked.
