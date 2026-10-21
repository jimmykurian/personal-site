<!-- Copyright (c) 2026 Jimmy Kurian. All rights reserved. See LICENSE. Author: Jimmy Kurian. -->

# Documentation

How jimmykurian.me is built, deployed, designed, secured and tested.

## Documentation index

| Section | Covers |
| --- | --- |
| [Architecture](architecture/README.md) | C4 context and containers, the UML content model, and flow and sequence diagrams |
| [Deployment](deployment/overview.md) | The CI pipeline, previews, production, the nightly rebuild, releases and rolling back |
| [Design](design/design-guidelines.md) | The editorial direction, palette tokens, type, the ledger layout, components and motion |
| [Security](security/overview.md) | The site's defenses, the supply chain, repository controls, secrets and private data |
| [Testing](testing/testing-strategy.md) | The unit, integration, end-to-end, Lighthouse and module test suites, and what each gates |

## Related documentation

These files at the root and in the subprojects cover the rest:

| File | Covers |
| --- | --- |
| [README.md](../README.md) | What the site is, the status badges, the system overview, the principles and the repo structure |
| [CONTRIBUTING.md](../CONTRIBUTING.md) | Setup, the workflow, commits, every check and its config, tests, deploys, releases, and the content and design rules |
| [AGENTS.md](../AGENTS.md) | Rules for coding agents; `website/` and `infrastructure/` each have their own |
| [SECURITY.md](../SECURITY.md) | How to report a vulnerability, and what's in scope |
| [CODE_OF_CONDUCT.md](../CODE_OF_CONDUCT.md) | Community standards |

## Subproject documentation

| Subproject | README | Generated docs |
| --- | --- | --- |
| [website/](../website/README.md) | Content, posts, the resume, the reading list and the test suites | [TypeDoc API docs](../website/docs/README.md) |
| [infrastructure/](../infrastructure/README.md) | The OpenTofu modules, their tests and how the live resources were created | [Module docs](../infrastructure/docs/modules/azure/static-web-app/README.md) (terraform-docs) |

## Contributing to the docs

Follow the [style guide](STYLE_GUIDE.md).

Last reviewed: 2026-10-20
