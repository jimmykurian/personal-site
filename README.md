# jimmykurian.me

The source of [jimmykurian.me](https://www.jimmykurian.me), Jimmy Kurian's personal site: a portfolio, a resume and a blog. It's a static [Astro](https://astro.build) site on Azure Static Web Apps, built and checked by GitHub Actions. The repository is public to read; see [License](#license).

## Repository

| Folder | What it is | Docs |
| --- | --- | --- |
| [`website/`](website/) | The Astro site: pages, components, content, the resume, and its unit, integration and end-to-end tests | [README](website/README.md), [AGENTS.md](website/AGENTS.md) |
| [`infrastructure/`](infrastructure/) | OpenTofu modules and tests for the Azure resources (not yet used to deploy) | [README](infrastructure/README.md), [AGENTS.md](infrastructure/AGENTS.md) |
| Root | Tooling shared by both: `.mise.toml`, `Taskfile.yml`, `.config/`, `.githooks/`, `.devcontainer/`, `.github/` | [CONTRIBUTING](CONTRIBUTING.md), [AGENTS.md](AGENTS.md) |

Coding agents start from the root [AGENTS.md](AGENTS.md), then read the subproject's own before working in it.

## Architecture

```text
src/content/*.json, posts/*.mdx      Goodreads shelf RSS     fonts
src/data/site.json (typed schemas)   (fetched at build)      (downloaded at build)
              |                             |                       |
              +-----------------------------+-----------------------+
                                            |
                                            v
                              astro build (static output)
                                            |
                                            v
              dist/: HTML, RSS, sitemap, optimized images, and
              resume.pdf (printed from /resume/ by headless Chrome)
                                            |
                                            v
    unit tests -> integration tests on dist/ -> e2e + axe in Chrome -> Lighthouse
                                            |
                                            v
          Azure Static Web Apps (Free): production on main, a preview per PR
                                            |
                                            v
          www.jimmykurian.me (DNS at Namecheap; www is the canonical host)
```

- **Content is data.** The pages render JSON collections and MDX posts, validated by the schemas in `website/src/content.config.ts`. A bad field fails the build instead of shipping.
- **Built once, served static.** There's no server, database, login or cookie. `public/staticwebapp.config.json` sets the security headers, the 404 page and caching.
- **External data comes in at build time.** `/reading/` is built from the Goodreads RSS feeds, covers and fonts are downloaded and optimized then, and the live site makes no third-party requests. A nightly rebuild picks up new books. If Goodreads is down, the build fails and the last deploy stays live.
- **The resume is a page.** `/resume/` renders from the same data as the site, and CI prints it to `/resume.pdf`, so the two never disagree.
- **Infrastructure as code, in progress.** The Azure resources were created in the portal. `infrastructure/` models them as generic OpenTofu modules, tested against a mocked provider, ready to take over deploys later.

## Principles

- **Small and static.** No client framework: a few inline scripts, each respecting `prefers-reduced-motion`. Add an island only when a feature needs one.
- **Private by default.** Client names are anonymized, and the site and resume carry no home address, phone, personal email, clearance or patent application number. Tests check every published file for those patterns.
- **Accessible and fast.** axe checks WCAG 2.1 A and AA on every page at desktop and phone sizes. Lighthouse fails the build below 0.95 for accessibility.
- **Every check blocks.** Nothing only warns. A finding is fixed, or skipped inline with a reason.
- **One source of truth.** Tool versions live only in `.mise.toml`, and commands only in `Taskfile.yml`. CI and the git hooks run the same tasks you run locally.
- **Supply chain kept tight.** Actions are pinned to commit SHAs. Packages come only from registry.npmjs.org, with sha512 hashes. Renovate waits 7 days before taking a new version. gitleaks, CodeQL and secret scanning watch the code.
- **Reviewed changes only.** `main` takes squash-merged pull requests with signed commits, passing CI and CodeQL, and a Copilot review.
- **Own the writing.** Posts are published here first, then syndicated with canonical links back.
- **Editorial design.** Newsreader and Libre Franklin, a ruled ledger layout, and Sanzo Wada's color combination 207.

## Quality checks

`task lint` runs every check below. `task test`, `task build`, `task test:integration`, `task test:e2e` and `task lighthouse` cover the rest.

| Task | Checks | Config |
| --- | --- | --- |
| `lint:web` | `astro check`, ESLint (with accessibility rules for `.astro` markup), Prettier | `website/eslint.config.js`, `website/.prettierrc.json` |
| `lint:spelling` | cspell on posts, pages, docs and code | `.config/cspell.json`, words in `.config/cspell-words.txt` |
| `lint:markdown` | markdownlint on the `.md` files | `.config/.markdownlint-cli2.jsonc` |
| `lint:secrets` | gitleaks over the git history, including non-npm registry URLs | `.config/gitleaks.toml` |
| `lint:lockfile` | the lockfile: packages from registry.npmjs.org only, sha512 hashes only, no git dependencies, an upper bound on every override range, no npm or Yarn lockfile | |
| `lint:actions` | actionlint and zizmor on the workflows | |
| `lint:shell` | shellcheck on the scripts and hooks | |
| `lint:editorconfig` | every file against `.editorconfig` | `.config/editorconfig-checker.json` |
| `lint:commits` | commit messages (commitlint) | `.config/commitlintrc.json` |
| `infra:check` | `tofu fmt` and `validate`, TFLint, Checkov, provider pins | `infrastructure/` |

After `task build`, three more run against `dist/`:

- `task test:e2e` includes the axe checks on every page.
- `task lighthouse` fails below 0.95 for accessibility, 0.9 for SEO and best practices, or 0.8 for performance (the median of 3 runs; CI runners are noisy), or above 0.1 layout shift. `/resume/` is left out: it's the print source for the PDF, noindexed, with small contact links.
- `task lint:links` checks the external links with lychee (`.config/lychee.toml`). CI runs it nightly, after the deploy, so another site's outage doesn't block a push.

Prettier skips `.astro` and `.mdx` files: whitespace between inline elements renders in Astro templates, and Prettier's MDX support is MDX 1.

The git hooks in `.githooks/` are plain bash, so they need no `node_modules`:

- **pre-commit:** checks the staged files (secrets, the lockfile, spelling, formatting, ESLint, shellcheck, `tofu fmt`, actionlint) and refuses commits on `main`.
- **commit-msg:** checks the message against Conventional Commits.
- **pre-push:** refuses pushes to `main`, or deleting it. It runs the unit tests if `website/` changed and the module tests if `infrastructure/` changed, on a clean checkout of the pushed commit.

A check whose tool isn't installed is skipped with a warning. CI runs all of them, plus the build, e2e and Lighthouse.

Renovate (`.github/renovate.json`) updates the npm packages, the actions, the OpenTofu provider and the `.mise.toml` tools on weekends.

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
.github/workflows/       lint, build, test and deploy (azure-static-web-apps.yml); infrastructure checks
.github/ISSUE_TEMPLATE/  bug, feature and subtask forms; PULL_REQUEST_TEMPLATE.md beside it
.github/renovate.json    dependency updates
.config/                 configs for the repo-wide checks (cspell, markdownlint, gitleaks, lychee, ...)
.githooks/               pre-commit, commit-msg and pre-push hooks (task hooks:install)
.devcontainer/           devcontainer with the pinned tools, dependencies and Chrome
.vscode/                 VS Code: recommended extensions, settings, debug configs, the dev-server task, snippets
.mise.toml               tool versions
Taskfile.yml             every check, test and build step, by name
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
