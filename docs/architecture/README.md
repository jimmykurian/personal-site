<!-- Copyright (c) 2026 Jimmy Kurian. All rights reserved. See LICENSE. Author: Jimmy Kurian. -->

# Architecture

The diagram index: how jimmykurian.me is built, deployed and served, in Mermaid diagrams that GitHub renders in place. The root [README](../../README.md#architecture) has the one-page system view.

| Diagram | Kind | Shows |
| --- | --- | --- |
| [System context](c4.md#system-context) | C4 level 1 | The visitor and Jimmy, the site, and the outside systems it depends on |
| [Containers](c4.md#containers) | C4 level 2 | `website/`, `infrastructure/`, the root tooling and CI, and what each one talks to |
| [Collections, helpers and pages](content-model.md) | UML class | The content collections in `website/src/content.config.ts`, the helpers in `website/src/lib/` and the pages that read them |
| [Build and deploy](flows.md#build-and-deploy) | Flowchart | Content, Goodreads and fonts into `astro build`, the checks, and the deploy gate |
| [A change, from branch to production](flows.md#a-change-from-branch-to-production) | Sequence | A PR's checks and preview, the merge, the production deploy and the release PR |
| [Nightly rebuild](flows.md#nightly-rebuild) | Sequence | The scheduled rebuild, the Goodreads retries and the saved-books fallback |
| [A visitor's request](flows.md#a-visitors-request) | Sequence | DNS, the static page and its headers, cached assets, the apex redirect and the 404 page |

Keep them in step with the code: a change to the collections, the CI jobs or the hosting updates the diagram that shows it.

## See also

- [Documentation index](../README.md)
- [Deployment overview](../deployment/overview.md)

Last reviewed: 2026-10-20
