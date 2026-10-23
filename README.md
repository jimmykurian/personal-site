<!-- Copyright (c) 2026 Jimmy Kurian. All rights reserved. See LICENSE. Author: Jimmy Kurian. -->

# jimmykurian.me

The source of [jimmykurian.me](https://www.jimmykurian.me), Jimmy Kurian's personal site: a portfolio, a resume and a blog. It's a static [Astro](https://astro.build) site on Azure Static Web Apps, built and checked by GitHub Actions. The repository is public to read; see [License](#license).

## Status

Each badge is a check from the last CI run on `main` (`.github/workflows/ci.yml` writes them to the `badges` branch). On a pull request, the same checks report in a comment on the PR.

### Monorepo

| Branch | Headers | Lockfile | Dedupe | Workflows | Shell | EditorConfig | Markdown | Spelling | Inclusive language | YAML | Schemas | Commits |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| main | [![Headers](https://img.shields.io/endpoint?url=https%3A%2F%2Fraw.githubusercontent.com%2Fjimmykurian%2Fpersonal-site%2Fbadges%2Frepository%2Fheaders.json&style=flat-square&logo=creativecommons&logoColor=white&label=%20&labelColor=555)](https://github.com/jimmykurian/personal-site/actions/workflows/ci.yml?query=branch%3Amain) | [![Lockfile](https://img.shields.io/endpoint?url=https%3A%2F%2Fraw.githubusercontent.com%2Fjimmykurian%2Fpersonal-site%2Fbadges%2Frepository%2Flockfile.json&style=flat-square&logo=pnpm&logoColor=white&label=%20&labelColor=555)](https://github.com/jimmykurian/personal-site/actions/workflows/ci.yml?query=branch%3Amain) | [![Dedupe](https://img.shields.io/endpoint?url=https%3A%2F%2Fraw.githubusercontent.com%2Fjimmykurian%2Fpersonal-site%2Fbadges%2Frepository%2Fdedupe.json&style=flat-square&logo=pnpm&logoColor=white&label=%20&labelColor=555)](https://github.com/jimmykurian/personal-site/actions/workflows/ci.yml?query=branch%3Amain) | [![Workflows](https://img.shields.io/endpoint?url=https%3A%2F%2Fraw.githubusercontent.com%2Fjimmykurian%2Fpersonal-site%2Fbadges%2Frepository%2Fworkflows.json&style=flat-square&logo=githubactions&logoColor=white&label=%20&labelColor=555)](https://github.com/jimmykurian/personal-site/actions/workflows/ci.yml?query=branch%3Amain) | [![Shell](https://img.shields.io/endpoint?url=https%3A%2F%2Fraw.githubusercontent.com%2Fjimmykurian%2Fpersonal-site%2Fbadges%2Frepository%2Fshell.json&style=flat-square&logo=gnubash&logoColor=white&label=%20&labelColor=555)](https://github.com/jimmykurian/personal-site/actions/workflows/ci.yml?query=branch%3Amain) | [![EditorConfig](https://img.shields.io/endpoint?url=https%3A%2F%2Fraw.githubusercontent.com%2Fjimmykurian%2Fpersonal-site%2Fbadges%2Frepository%2Feditorconfig.json&style=flat-square&logo=editorconfig&logoColor=white&label=%20&labelColor=555)](https://github.com/jimmykurian/personal-site/actions/workflows/ci.yml?query=branch%3Amain) | [![Markdown](https://img.shields.io/endpoint?url=https%3A%2F%2Fraw.githubusercontent.com%2Fjimmykurian%2Fpersonal-site%2Fbadges%2Frepository%2Fmarkdown.json&style=flat-square&logo=markdown&logoColor=white&label=%20&labelColor=555)](https://github.com/jimmykurian/personal-site/actions/workflows/ci.yml?query=branch%3Amain) | [![Spelling](https://img.shields.io/endpoint?url=https%3A%2F%2Fraw.githubusercontent.com%2Fjimmykurian%2Fpersonal-site%2Fbadges%2Frepository%2Fspelling.json&style=flat-square&logo=grammarly&logoColor=white&label=%20&labelColor=555)](https://github.com/jimmykurian/personal-site/actions/workflows/ci.yml?query=branch%3Amain) | [![Inclusive language](https://img.shields.io/endpoint?url=https%3A%2F%2Fraw.githubusercontent.com%2Fjimmykurian%2Fpersonal-site%2Fbadges%2Frepository%2Flanguage.json&style=flat-square&logo=alexa&logoColor=white&label=%20&labelColor=555)](https://github.com/jimmykurian/personal-site/actions/workflows/ci.yml?query=branch%3Amain) | [![YAML](https://img.shields.io/endpoint?url=https%3A%2F%2Fraw.githubusercontent.com%2Fjimmykurian%2Fpersonal-site%2Fbadges%2Frepository%2Fyaml.json&style=flat-square&logo=yaml&logoColor=white&label=%20&labelColor=555)](https://github.com/jimmykurian/personal-site/actions/workflows/ci.yml?query=branch%3Amain) | [![Schemas](https://img.shields.io/endpoint?url=https%3A%2F%2Fraw.githubusercontent.com%2Fjimmykurian%2Fpersonal-site%2Fbadges%2Frepository%2Fschemas.json&style=flat-square&logo=json&logoColor=white&label=%20&labelColor=555)](https://github.com/jimmykurian/personal-site/actions/workflows/ci.yml?query=branch%3Amain) | [![Commits](https://img.shields.io/endpoint?url=https%3A%2F%2Fraw.githubusercontent.com%2Fjimmykurian%2Fpersonal-site%2Fbadges%2Frepository%2Fcommits.json&style=flat-square&logo=commitlint&logoColor=white&label=%20&labelColor=555)](https://github.com/jimmykurian/personal-site/actions/workflows/ci.yml?query=branch%3Amain) |

### Website

| Branch | Types | ESLint | Prettier | Stylelint | Dead code | API docs | Unit tests | Coverage | Build | Integration | End-to-end | Lighthouse |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| main | [![Types](https://img.shields.io/endpoint?url=https%3A%2F%2Fraw.githubusercontent.com%2Fjimmykurian%2Fpersonal-site%2Fbadges%2Fwebsite%2Ftypes.json&style=flat-square&logo=typescript&logoColor=white&label=%20&labelColor=555)](https://github.com/jimmykurian/personal-site/actions/workflows/ci.yml?query=branch%3Amain) | [![ESLint](https://img.shields.io/endpoint?url=https%3A%2F%2Fraw.githubusercontent.com%2Fjimmykurian%2Fpersonal-site%2Fbadges%2Fwebsite%2Feslint.json&style=flat-square&logo=eslint&logoColor=white&label=%20&labelColor=555)](https://github.com/jimmykurian/personal-site/actions/workflows/ci.yml?query=branch%3Amain) | [![Prettier](https://img.shields.io/endpoint?url=https%3A%2F%2Fraw.githubusercontent.com%2Fjimmykurian%2Fpersonal-site%2Fbadges%2Fwebsite%2Fprettier.json&style=flat-square&logo=prettier&logoColor=white&label=%20&labelColor=555)](https://github.com/jimmykurian/personal-site/actions/workflows/ci.yml?query=branch%3Amain) | [![Stylelint](https://img.shields.io/endpoint?url=https%3A%2F%2Fraw.githubusercontent.com%2Fjimmykurian%2Fpersonal-site%2Fbadges%2Fwebsite%2Fstylelint.json&style=flat-square&logo=stylelint&logoColor=white&label=%20&labelColor=555)](https://github.com/jimmykurian/personal-site/actions/workflows/ci.yml?query=branch%3Amain) | [![Dead code](https://img.shields.io/endpoint?url=https%3A%2F%2Fraw.githubusercontent.com%2Fjimmykurian%2Fpersonal-site%2Fbadges%2Fwebsite%2Fdead-code.json&style=flat-square&logo=javascript&logoColor=white&label=%20&labelColor=555)](https://github.com/jimmykurian/personal-site/actions/workflows/ci.yml?query=branch%3Amain) | [![API docs](https://img.shields.io/endpoint?url=https%3A%2F%2Fraw.githubusercontent.com%2Fjimmykurian%2Fpersonal-site%2Fbadges%2Fwebsite%2Fdocs.json&style=flat-square&logo=typescript&logoColor=white&label=%20&labelColor=555)](https://github.com/jimmykurian/personal-site/actions/workflows/ci.yml?query=branch%3Amain) | [![Unit tests](https://img.shields.io/endpoint?url=https%3A%2F%2Fraw.githubusercontent.com%2Fjimmykurian%2Fpersonal-site%2Fbadges%2Fwebsite%2Funit.json&style=flat-square&logo=vitest&logoColor=white&label=%20&labelColor=555)](https://github.com/jimmykurian/personal-site/actions/workflows/ci.yml?query=branch%3Amain) | [![Coverage](https://img.shields.io/endpoint?url=https%3A%2F%2Fraw.githubusercontent.com%2Fjimmykurian%2Fpersonal-site%2Fbadges%2Fwebsite%2Fcoverage.json&style=flat-square&logo=vitest&logoColor=white&label=%20&labelColor=555)](https://github.com/jimmykurian/personal-site/actions/workflows/ci.yml?query=branch%3Amain) | [![Build](https://img.shields.io/endpoint?url=https%3A%2F%2Fraw.githubusercontent.com%2Fjimmykurian%2Fpersonal-site%2Fbadges%2Fwebsite%2Fbuild.json&style=flat-square&logo=astro&logoColor=white&label=%20&labelColor=555)](https://github.com/jimmykurian/personal-site/actions/workflows/ci.yml?query=branch%3Amain) | [![Integration](https://img.shields.io/endpoint?url=https%3A%2F%2Fraw.githubusercontent.com%2Fjimmykurian%2Fpersonal-site%2Fbadges%2Fwebsite%2Fintegration.json&style=flat-square&logo=vitest&logoColor=white&label=%20&labelColor=555)](https://github.com/jimmykurian/personal-site/actions/workflows/ci.yml?query=branch%3Amain) | [![End-to-end](https://img.shields.io/endpoint?url=https%3A%2F%2Fraw.githubusercontent.com%2Fjimmykurian%2Fpersonal-site%2Fbadges%2Fwebsite%2Fe2e.json&style=flat-square&logo=playwright&logoColor=white&label=%20&labelColor=555)](https://github.com/jimmykurian/personal-site/actions/workflows/ci.yml?query=branch%3Amain) | [![Lighthouse](https://img.shields.io/endpoint?url=https%3A%2F%2Fraw.githubusercontent.com%2Fjimmykurian%2Fpersonal-site%2Fbadges%2Fwebsite%2Flighthouse.json&style=flat-square&logo=lighthouse&logoColor=white&label=%20&labelColor=555)](https://github.com/jimmykurian/personal-site/actions/workflows/ci.yml?query=branch%3Amain) |

### Infrastructure

| Branch | Format | Validate | TFLint | Checkov | Provider pins | Module docs | Acceptance tests | Integration tests |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| main | [![Format](https://img.shields.io/endpoint?url=https%3A%2F%2Fraw.githubusercontent.com%2Fjimmykurian%2Fpersonal-site%2Fbadges%2Finfrastructure%2Fformat.json&style=flat-square&logo=opentofu&logoColor=white&label=%20&labelColor=555)](https://github.com/jimmykurian/personal-site/actions/workflows/ci.yml?query=branch%3Amain) | [![Validate](https://img.shields.io/endpoint?url=https%3A%2F%2Fraw.githubusercontent.com%2Fjimmykurian%2Fpersonal-site%2Fbadges%2Finfrastructure%2Fvalidate.json&style=flat-square&logo=opentofu&logoColor=white&label=%20&labelColor=555)](https://github.com/jimmykurian/personal-site/actions/workflows/ci.yml?query=branch%3Amain) | [![TFLint](https://img.shields.io/endpoint?url=https%3A%2F%2Fraw.githubusercontent.com%2Fjimmykurian%2Fpersonal-site%2Fbadges%2Finfrastructure%2Ftflint.json&style=flat-square&logo=terraform&logoColor=white&label=%20&labelColor=555)](https://github.com/jimmykurian/personal-site/actions/workflows/ci.yml?query=branch%3Amain) | [![Checkov](https://img.shields.io/endpoint?url=https%3A%2F%2Fraw.githubusercontent.com%2Fjimmykurian%2Fpersonal-site%2Fbadges%2Finfrastructure%2Fcheckov.json&style=flat-square&logo=paloaltonetworks&logoColor=white&label=%20&labelColor=555)](https://github.com/jimmykurian/personal-site/actions/workflows/ci.yml?query=branch%3Amain) | [![Provider pins](https://img.shields.io/endpoint?url=https%3A%2F%2Fraw.githubusercontent.com%2Fjimmykurian%2Fpersonal-site%2Fbadges%2Finfrastructure%2Fpins.json&style=flat-square&logo=opentofu&logoColor=white&label=%20&labelColor=555)](https://github.com/jimmykurian/personal-site/actions/workflows/ci.yml?query=branch%3Amain) | [![Module docs](https://img.shields.io/endpoint?url=https%3A%2F%2Fraw.githubusercontent.com%2Fjimmykurian%2Fpersonal-site%2Fbadges%2Finfrastructure%2Fdocs.json&style=flat-square&logo=opentofu&logoColor=white&label=%20&labelColor=555)](https://github.com/jimmykurian/personal-site/actions/workflows/ci.yml?query=branch%3Amain) | [![Acceptance tests](https://img.shields.io/endpoint?url=https%3A%2F%2Fraw.githubusercontent.com%2Fjimmykurian%2Fpersonal-site%2Fbadges%2Finfrastructure%2Facceptance.json&style=flat-square&logo=opentofu&logoColor=white&label=%20&labelColor=555)](https://github.com/jimmykurian/personal-site/actions/workflows/ci.yml?query=branch%3Amain) | [![Integration tests](https://img.shields.io/endpoint?url=https%3A%2F%2Fraw.githubusercontent.com%2Fjimmykurian%2Fpersonal-site%2Fbadges%2Finfrastructure%2Fintegration.json&style=flat-square&logo=opentofu&logoColor=white&label=%20&labelColor=555)](https://github.com/jimmykurian/personal-site/actions/workflows/ci.yml?query=branch%3Amain) |

### Security & Code Quality

| Branch | CodeQL | Code quality | Secret scanning | gitleaks | secretlint | npm audit | OSV | Licenses | Dependabot | Renovate | Dependency review |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| main | [![CodeQL](https://img.shields.io/badge/%20-enabled-brightgreen?style=flat-square&logo=github&logoColor=white&labelColor=555)](https://github.com/jimmykurian/personal-site/security/code-scanning) | [![Code quality](https://img.shields.io/badge/%20-required-brightgreen?style=flat-square&logo=github&logoColor=white&labelColor=555)](https://github.com/jimmykurian/personal-site/security/code-scanning) | [![Secret scanning](https://img.shields.io/badge/%20-push%20protection-brightgreen?style=flat-square&logo=github&logoColor=white&labelColor=555)](https://github.com/jimmykurian/personal-site/security/secret-scanning) | [![gitleaks](https://img.shields.io/endpoint?url=https%3A%2F%2Fraw.githubusercontent.com%2Fjimmykurian%2Fpersonal-site%2Fbadges%2Fsecurity%2Fgitleaks.json&style=flat-square&logo=git&logoColor=white&label=%20&labelColor=555)](https://github.com/jimmykurian/personal-site/actions/workflows/ci.yml?query=branch%3Amain) | [![secretlint](https://img.shields.io/endpoint?url=https%3A%2F%2Fraw.githubusercontent.com%2Fjimmykurian%2Fpersonal-site%2Fbadges%2Fsecurity%2Fsecretlint.json&style=flat-square&logo=gnuprivacyguard&logoColor=white&label=%20&labelColor=555)](https://github.com/jimmykurian/personal-site/actions/workflows/ci.yml?query=branch%3Amain) | [![npm audit](https://img.shields.io/endpoint?url=https%3A%2F%2Fraw.githubusercontent.com%2Fjimmykurian%2Fpersonal-site%2Fbadges%2Fsecurity%2Faudit.json&style=flat-square&logo=npm&logoColor=white&label=%20&labelColor=555)](https://github.com/jimmykurian/personal-site/actions/workflows/ci.yml?query=branch%3Amain) | [![OSV](https://img.shields.io/endpoint?url=https%3A%2F%2Fraw.githubusercontent.com%2Fjimmykurian%2Fpersonal-site%2Fbadges%2Fsecurity%2Fosv.json&style=flat-square&logo=google&logoColor=white&label=%20&labelColor=555)](https://github.com/jimmykurian/personal-site/actions/workflows/ci.yml?query=branch%3Amain) | [![Licenses](https://img.shields.io/endpoint?url=https%3A%2F%2Fraw.githubusercontent.com%2Fjimmykurian%2Fpersonal-site%2Fbadges%2Fsecurity%2Flicenses.json&style=flat-square&logo=creativecommons&logoColor=white&label=%20&labelColor=555)](https://github.com/jimmykurian/personal-site/actions/workflows/ci.yml?query=branch%3Amain) | [![Dependabot](https://img.shields.io/badge/%20-security%20updates-brightgreen?style=flat-square&logo=dependabot&logoColor=white&labelColor=555)](https://github.com/jimmykurian/personal-site/security/dependabot) | [![Renovate](https://img.shields.io/badge/%20-weekly%2C%20grouped-1A1F6C?style=flat-square&logo=renovatebot&logoColor=white&labelColor=555)](https://docs.renovatebot.com/) | [![Dependency review](https://img.shields.io/badge/%20-on%20every%20PR-brightgreen?style=flat-square&logo=github&logoColor=white&labelColor=555)](https://docs.github.com/code-security/supply-chain-security/understanding-your-software-supply-chain/about-dependency-review) |

### Tech Stack

| Astro | TypeScript | MDX | Node.js | pnpm | Vitest | Playwright | OpenTofu | Task | mise |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| [![Astro](https://img.shields.io/badge/%20-7.4-BC52EE?style=flat-square&logo=astro&logoColor=white&labelColor=555)](https://astro.build/) | [![TypeScript](https://img.shields.io/badge/%20-6.0-3178C6?style=flat-square&logo=typescript&logoColor=white&labelColor=555)](https://www.typescriptlang.org/) | [![MDX](https://img.shields.io/badge/%20-%40astrojs%2Fmdx%208-1B1F24?style=flat-square&logo=mdx&logoColor=white&labelColor=555)](https://mdxjs.com/) | [![Node.js](https://img.shields.io/badge/%20-22-5FA04E?style=flat-square&logo=nodedotjs&logoColor=white&labelColor=555)](https://nodejs.org/) | [![pnpm](https://img.shields.io/badge/%20-11-F69220?style=flat-square&logo=pnpm&logoColor=white&labelColor=555)](https://pnpm.io/) | [![Vitest](https://img.shields.io/badge/%20-5-6E9F18?style=flat-square&logo=vitest&logoColor=white&labelColor=555)](https://vitest.dev/) | [![Playwright](https://img.shields.io/badge/%20-1.63-2EAD33?style=flat-square&logo=playwright&logoColor=white&labelColor=555)](https://playwright.dev/) | [![OpenTofu](https://img.shields.io/badge/%20-1.11-FFDA18?style=flat-square&logo=opentofu&logoColor=black&labelColor=555)](https://opentofu.org/) | [![Task](https://img.shields.io/badge/%20-3-29BEB0?style=flat-square&logo=task&logoColor=white&labelColor=555)](https://taskfile.dev/) | [![mise](https://img.shields.io/badge/%20-tool%20versions-00ADD8?style=flat-square&logo=gnometerminal&logoColor=white&labelColor=555)](https://mise.jdx.dev/) |

### Hosting Stack

| Azure | GitHub Actions | Namecheap | Cloudflare | Sentry | PostHog |
| --- | --- | --- | --- | --- | --- |
| [![Azure](https://img.shields.io/badge/%20-Static%20Web%20Apps%20%28Free%29-0078D4?style=flat-square&logo=icloud&logoColor=white&labelColor=555)](https://azure.microsoft.com/products/app-service/static) | [![GitHub Actions](https://img.shields.io/badge/%20-CI%20and%20deploy-2088FF?style=flat-square&logo=githubactions&logoColor=white&labelColor=555)](https://github.com/jimmykurian/personal-site/actions) | [![Namecheap](https://img.shields.io/badge/%20-DNS-DE3723?style=flat-square&logo=namecheap&logoColor=white&labelColor=555)](https://www.namecheap.com/) | [![Cloudflare](https://img.shields.io/badge/%20-Web%20Analytics-F38020?style=flat-square&logo=cloudflare&logoColor=white&labelColor=555)](https://www.cloudflare.com/web-analytics/) | [![Sentry](https://img.shields.io/badge/%20-Errors-362D59?style=flat-square&logo=sentry&logoColor=white&labelColor=555)](https://sentry.io/) | [![PostHog](https://img.shields.io/badge/%20-Events%20%28cookieless%29-1D4AFF?style=flat-square&logo=posthog&logoColor=white&labelColor=555)](https://posthog.com/) |

## Code metrics

The size and complexity of the code: lines of code without blanks or comments ([scc](https://github.com/boyter/scc)), and the cyclomatic complexity of every function (ESLint's `complexity` rule). After a merge that changes the code, `.github/workflows/code-metrics.yml` proposes an update in a pull request. Run `task metrics` to see them locally.

<!-- METRICS:START -->

| Metric | Website | Infrastructure | Total |
| --- | --- | --- | --- |
| Files | 24 | 8 | 32 |
| Lines of code | 3,089 | 138 | 3,227 |
| Functions | 176 | – | 176 |
| Average complexity | 1.9 | – | 1.9 |
| Max complexity | 9 | – | 9 |
| Modules | – | 2 | 2 |
| Resources | – | 3 | 3 |

<details>
<summary>The 10 most complex functions</summary>

| Function | Where | Complexity |
| --- | --- | --- |
| async arrow function | `website/src/pages/index.astro:908` | 9 |
| `installedPackages` | `website/scripts/check-licenses.mjs:96` | 8 |
| `main` | `website/scripts/check-licenses.mjs:135` | 8 |
| `load` | `website/src/lib/goodreads.ts:105` | 8 |
| `collectComplexity` | `website/scripts/code-metrics.mjs:38` | 7 |
| `retryDelay` | `website/src/lib/goodreads.ts:28` | 7 |
| `fetchFeed` | `website/src/lib/goodreads.ts:36` | 7 |
| `atom` | `website/scripts/check-licenses.mjs:42` | 6 |
| `licenseOf` | `website/scripts/check-licenses.mjs:86` | 6 |
| arrow function | `website/src/pages/index.astro:120` | 6 |

</details>

<!-- METRICS:END -->

## Repository

| Folder | What it is | Docs |
| --- | --- | --- |
| [`website/`](website/) | The Astro site: pages, components, content, the resume, and its unit, integration and end-to-end tests | [README](website/README.md), [AGENTS.md](website/AGENTS.md) |
| [`infrastructure/`](infrastructure/) | OpenTofu modules and tests for the Azure resources (not yet used to deploy) | [README](infrastructure/README.md), [AGENTS.md](infrastructure/AGENTS.md) |
| Root | Tooling shared by both: `.mise.toml`, `Taskfile.yml`, `.config/`, `.githooks/`, `.devcontainer/`, `.github/` | [CONTRIBUTING](CONTRIBUTING.md), [AGENTS.md](AGENTS.md) |

Coding agents start from the root [AGENTS.md](AGENTS.md), then read the subproject's own before working in it.

## Architecture

- **Content is data.** The pages render JSON collections and MDX posts, validated by the schemas in `website/src/content.config.ts`. A bad field fails the build instead of shipping.
- **Built once, served static.** There's no server, database, login or cookie. `public/staticwebapp.config.json` sets the security headers, the 404 page and caching.
- **External data comes in at build time.** `/reading/` is built from the Goodreads RSS feeds, covers and fonts are downloaded and optimized then, and the live site makes no third-party requests. A nightly rebuild picks up new books. Brief Goodreads errors are retried; if it's still down, the build fails and the last deploy stays live.
- **The resume is a page.** `/resume/` renders from the same data as the site, and CI prints it to `/resume.pdf`, so the two never disagree.
- **Infrastructure as code, in progress.** The Azure resources were created in the portal. `infrastructure/` models them as generic OpenTofu modules, tested against a mocked provider, ready to take over deploys later.

### System overview

```mermaid
flowchart TB
    jimmy(["Jimmy"])
    visitor(["Visitor"])

    subgraph repo["GitHub: jimmykurian/personal-site"]
        website["website/<br/>Astro 7, TypeScript, MDX"]
        infra["infrastructure/<br/>OpenTofu modules"]
        tooling["Root tooling<br/>mise, Task, git hooks"]
    end

    subgraph github["GitHub services"]
        ci["GitHub Actions CI<br/>lint, test, build, deploy,<br/>nightly rebuild"]
        bots["CodeQL, Copilot review, Renovate,<br/>Dependabot, Release Please"]
    end

    subgraph inputs["Fetched at build time"]
        goodreads["Goodreads shelf RSS"]
        fonts["Google Fonts"]
    end

    subgraph azure["Azure, personal subscription"]
        swa["Static Web Apps (Free)<br/>production and a preview per PR"]
    end

    dns["Namecheap DNS<br/>www CNAME, apex ALIAS"]

    jimmy -- "branches and PRs" --> repo
    repo -- "every push and PR" --> ci
    bots -. "scans, reviews, updates, releases" .-> repo
    goodreads & fonts --> ci
    ci -- "uploads dist/ when the site was built<br/>and every check passed" --> swa
    infra -. "models it, no deploys yet" .-> swa
    visitor -- "www.jimmykurian.me" --> dns
    visitor -- "HTTPS" --> swa
```

[docs/architecture/](docs/architecture/README.md) has the rest: the C4 context and container views, a UML class diagram of the content model, and flow and sequence diagrams for the build, a change reaching production, the nightly rebuild and a visitor's request.

## Principles

- **Small and static.** No client framework: a few inline scripts, each respecting `prefers-reduced-motion`. Add an island only when a feature needs one.
- **Private by default.** Client names are anonymized, and the site and resume carry no home address, phone, personal email, clearance or patent application number. Tests check every published file for those patterns.
- **Measured without cookies.** Cloudflare Web Analytics, Sentry and PostHog run cookieless, with no replay or profiles, and only in production. A Content-Security-Policy allows no other outside host ([docs/observability.md](docs/observability.md)).
- **Accessible and fast.** The goal is WCAG 2.2 AA ([docs/accessibility.md](docs/accessibility.md)): axe checks the 2.0, 2.1 and 2.2 A and AA rules on every page at desktop and phone sizes. Lighthouse fails the build below 0.95 for accessibility.
- **Every check blocks.** Nothing only warns. A finding is fixed, or skipped inline with a reason.
- **One source of truth.** Tool versions live only in `.mise.toml`, and commands only in `Taskfile.yml`. CI and the git hooks run the same tasks you run locally.
- **Supply chain kept tight.** Actions are pinned to commit SHAs. Packages come only from registry.npmjs.org, with sha512 hashes. Renovate waits 7 days before taking a new version. gitleaks, CodeQL and secret scanning watch the code.
- **Reviewed changes only.** `main` takes squash-merged pull requests with signed commits, passing CI and CodeQL, and a Copilot review.
- **Own the writing.** Posts are published here first, then syndicated with canonical links back.
- **Editorial design.** Newsreader and Libre Franklin, a ruled ledger layout, and Sanzo Wada's color combination 207.

## Quality checks

Every check fails the build; none is warn-only. `task lint` runs them all, grouped into the repository, the website and the infrastructure, and `task test`, `task build`, `task test:integration`, `task test:e2e` and `task lighthouse` cover the rest. The git hooks run the fast ones on each commit and push.

On each pull request, CI runs every check for the parts that changed and posts one comment with a table of the results, the coverage and the test counts; merging needs them to pass. Renovate handles version updates weekly, Dependabot handles security updates, and Release Please versions `website/` and `infrastructure/`.

[CONTRIBUTING.md](CONTRIBUTING.md#quality-checks) lists every check, its config and the hooks.

## Getting started

```sh
mise install        # Node, OpenTofu and the linters, at the pinned versions
task install        # mise install, then the website's dependencies
task hooks:install  # the git hooks in .githooks/
task                # list every task
```

The devcontainer (`.devcontainer/`) does all of that on creation, for VS Code or Codespaces. [website/README.md](website/README.md) covers running the site and editing the content. [CONTRIBUTING.md](CONTRIBUTING.md) covers the workflow, commits and checks.

## Structure

```text
.github/workflows/       every check, the deploy and the PR check table (ci.yml); PR labels, assignee, title and template checks; releases; code metrics
.github/labeler.yml      which paths get which pull request label
.github/CODEOWNERS       Jimmy owns everything, so bot PRs request Jimmy's review
badges branch            the README status badges, written by CI (never merged; not a working branch)
.github/ISSUE_TEMPLATE/  bug, feature and subtask forms; PULL_REQUEST_TEMPLATE.md beside it
.github/renovate.json    version updates (weekly, grouped)
.github/dependabot.yml   security updates only
.github/*release-please* Release Please's settings and the current version of each package
.config/                 repo-wide check configs: commitlint and Lighthouse at the top, then
  formatters/              Prettier
  linters/                 gitleaks, secretlint, editorconfig, markdownlint, yamllint, v8r, lychee
  spelling/                cspell and the project word list
  licenses/                allowed licenses and excluded packages (with a README)
.githooks/               pre-commit, commit-msg and pre-push hooks (task hooks:install)
.devcontainer/           devcontainer with the pinned tools, dependencies and Chrome
.vscode/                 VS Code: recommended extensions, settings, debug configs, the dev-server task, snippets
.mise.toml               tool versions
.alexrc.yml              inclusive-language allow list (alex reads it only from the root)
Taskfile.yml             every check, test and build step, by name
docs/                    accessibility, architecture, deployment, design, observability, security and testing docs, and the docs style guide
infrastructure/          OpenTofu modules and tests for the Azure resources (see infrastructure/README.md)
website/                 the Astro site (see website/README.md)
AGENTS.md                what coding agents need on every task
LICENSE                  proprietary, all rights reserved
SECURITY.md              how to report a vulnerability, and how the site is secured
CONTRIBUTING.md          setup, workflow, commits, signing, checks before pushing, content and design rules
CODE_OF_CONDUCT.md       Contributor Covenant 2.1, adapted
```

## License

Proprietary. All rights reserved; see [LICENSE](LICENSE). The source is public to read, but I'm its only contributor and don't accept pull requests or issues ([CONTRIBUTING.md](CONTRIBUTING.md)). Third-party packages, fonts and icons keep their own licenses.
