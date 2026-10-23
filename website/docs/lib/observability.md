[**jimmykurian.me website**](../README.md)

***

[jimmykurian.me website](../README.md) / lib/observability

# lib/observability

Starts Sentry (errors) and PostHog (named events) in the browser, cookieless and only on a
production build. Cloudflare Web Analytics is a plain script tag in `Observability.astro`.
See `docs/observability.md`.

## Interfaces

### ObservabilityEnv

Defined in: [src/lib/observability.ts:14](https://github.com/jimmykurian/personal-site/blob/main/website/src/lib/observability.ts#L14)

The build's public settings: set from GitHub repository variables on `main` only.

#### Properties

| Property | Type | Defined in |
| ------ | ------ | ------ |
| <a id="public_sentry_dsn"></a> `PUBLIC_SENTRY_DSN?` | `string` | [src/lib/observability.ts:15](https://github.com/jimmykurian/personal-site/blob/main/website/src/lib/observability.ts#L15) |
| <a id="public_sentry_release"></a> `PUBLIC_SENTRY_RELEASE?` | `string` | [src/lib/observability.ts:16](https://github.com/jimmykurian/personal-site/blob/main/website/src/lib/observability.ts#L16) |
| <a id="public_posthog_key"></a> `PUBLIC_POSTHOG_KEY?` | `string` | [src/lib/observability.ts:17](https://github.com/jimmykurian/personal-site/blob/main/website/src/lib/observability.ts#L17) |
| <a id="public_posthog_host"></a> `PUBLIC_POSTHOG_HOST?` | `string` | [src/lib/observability.ts:18](https://github.com/jimmykurian/personal-site/blob/main/website/src/lib/observability.ts#L18) |

***

### Loaders

Defined in: [src/lib/observability.ts:33](https://github.com/jimmykurian/personal-site/blob/main/website/src/lib/observability.ts#L33)

Loads each SDK; the defaults import them, so each is only downloaded when it's used.

#### Properties

| Property | Type | Description | Defined in |
| ------ | ------ | ------ | ------ |
| <a id="sentry"></a> `sentry` | () => `Promise`\<`SentryLike`\> | Loads `@sentry/browser`. | [src/lib/observability.ts:35](https://github.com/jimmykurian/personal-site/blob/main/website/src/lib/observability.ts#L35) |
| <a id="posthog"></a> `posthog` | () => `Promise`\<`PostHogLike`\> | Loads `posthog-js`. | [src/lib/observability.ts:37](https://github.com/jimmykurian/personal-site/blob/main/website/src/lib/observability.ts#L37) |
| <a id="idle"></a> `idle` | (`fn`) => `void` | Runs `fn` once the browser is idle, so PostHog never slows the first paint. | [src/lib/observability.ts:39](https://github.com/jimmykurian/personal-site/blob/main/website/src/lib/observability.ts#L39) |

## Functions

### sentryOptions()

```ts
function sentryOptions(env, origin): Record<string, unknown>;
```

Defined in: [src/lib/observability.ts:52](https://github.com/jimmykurian/personal-site/blob/main/website/src/lib/observability.ts#L52)

Sentry: uncaught errors from this site's own scripts. No tracing, replay or personal data.

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `env` | [`ObservabilityEnv`](#observabilityenv) |
| `origin` | `string` |

#### Returns

`Record`\<`string`, `unknown`\>

***

### posthogOptions()

```ts
function posthogOptions(env): Record<string, unknown>;
```

Defined in: [src/lib/observability.ts:67](https://github.com/jimmykurian/personal-site/blob/main/website/src/lib/observability.ts#L67)

PostHog: named events only, with no cookies, storage, profiles, autocapture or replay.

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `env` | [`ObservabilityEnv`](#observabilityenv) |

#### Returns

`Record`\<`string`, `unknown`\>

***

### startObservability()

```ts
function startObservability(
   env, 
   doc?, 
   origin?, 
   loaders?
): Promise<void>;
```

Defined in: [src/lib/observability.ts:96](https://github.com/jimmykurian/personal-site/blob/main/website/src/lib/observability.ts#L96)

Starts whichever tools the build has settings for. Without any (local, test and preview
builds), it does nothing.

#### Parameters

| Parameter | Type | Default value | Description |
| ------ | ------ | ------ | ------ |
| `env` | [`ObservabilityEnv`](#observabilityenv) | `undefined` | The build's public settings. |
| `doc?` | `Document` | `document` | The page, to listen for tracked clicks. |
| `origin?` | `string` | `location.origin` | The site's origin. |
| `loaders?` | [`Loaders`](#loaders) | `defaultLoaders` | How to load each SDK. |

#### Returns

`Promise`\<`void`\>

Resolves once the tools that were started are ready.
