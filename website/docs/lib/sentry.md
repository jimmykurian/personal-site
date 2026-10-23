[**jimmykurian.me website**](../README.md)

***

[jimmykurian.me website](../README.md) / lib/sentry

# lib/sentry

The one part of `@sentry/browser` the site uses. Importing it through this module lets the
bundler leave out the rest of the SDK (replay, tracing, feedback), which a dynamic import of
the whole package can't.
