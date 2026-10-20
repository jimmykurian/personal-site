# jimmykurian.me

Personal site of Jimmy Kurian. Built with [Astro](https://astro.build), content in typed collections, hosted on Azure Static Web Apps (Free tier) and deployed from GitHub Actions.

Design notes: editorial serif (Newsreader) with Libre Franklin for text, a ruled ledger layout, and a three-color palette from Sanzo Wada's *A Dictionary of Color Combinations*, combination 207: Black `#111314`, Sudan Brown `#a36752`, Glaucous Green `#b4cdc2`. Tokens live at the top of `src/styles/global.css`.

The site lives in `website/`. Run commands there; file paths below are relative to it.

## Run it

Tools are pinned in `.mise.toml` and run through [Task](https://taskfile.dev) (`Taskfile.yml`), the same way in CI:

```sh
mise install        # Node, OpenTofu and the linters, at the pinned versions
task install        # mise install, then the website's dependencies
task hooks:install  # git hooks in .githooks/
task                # list every task
```

The devcontainer (`.devcontainer/`) does all of that on creation, for VS Code or Codespaces.

```sh
cd website
pnpm dev           # http://localhost:4321
pnpm build         # static output in dist/
pnpm preview       # serve dist/ locally
pnpm test          # unit tests (Vitest)
pnpm test:integration  # builds the site, then checks the output
pnpm test:e2e      # Playwright in Chrome, against dist/ (build first)
```

Node is pinned in `.mise.toml`, and pnpm by `packageManager` in `website/package.json` (`corepack enable` installs it).

## Where the content lives

Everything on the site is data; the pages just render it. Edit these and the build picks it up:

| What                                   | File                                   |
| -------------------------------------- | -------------------------------------- |
| Headline, intro, links, focus areas, education, certifications | `src/data/site.json`          |
| Experience and Guard service           | `src/content/experience.json`          |
| Selected work                          | `src/content/projects.json`            |
| Publications, patent, talks            | `src/content/writing.json` (`featured: true` puts an item on the home page) |
| Teaching, speaking, community          | `src/content/teaching.json`            |
| Blog posts                             | `src/content/posts/*.mdx`              |
| Resume download                        | generated: `src/pages/resume.astro` prints to `dist/resume.pdf` |
| Portrait                               | `src/assets/portrait.jpg` (replace the file; Astro resizes it at build) |

Schemas are in `src/content.config.ts`. A missing field or a bad date fails the build rather than shipping. Entries in the JSON files render in the order they appear in the file.

Fonts (Newsreader, Libre Franklin) are configured in `astro.config.mjs` and downloaded at build time, so the live site makes no requests to Google.

### Writing a post

Create `src/content/posts/my-post.mdx`:

```mdx
---
title: "Post title"
description: "One or two sentences. Shows in the list, the feed, and link previews."
pubDate: 2026-11-01
tags: ["AI-assisted development", "Leadership"]
draft: false
---

Body in Markdown. MDX, so components work too.
```

- `draft: true` keeps a post visible in `pnpm dev` but out of the production build.
- `/writing/` lists posts by month. Tags are shown on the post page only.
- The feed is at `/rss.xml`, the sitemap at `/sitemap-index.xml`.
- If a piece was published elsewhere first, set `canonical: "https://..."` in the frontmatter and the page will point search engines at the original. Going the other way, publish here, then set the canonical URL on the LinkedIn or dev.to copy to the post's address here.

### The resume

The public resume is built from the same data as the site. `src/pages/resume.astro` lays it out for print, and `pnpm resume` prints it to `dist/resume.pdf` with headless Chrome (set `CHROME_PATH` if Chrome isn't in the usual place). CI runs it after the build, so `/resume.pdf` always matches the site.

```sh
pnpm build && pnpm resume   # writes dist/resume.pdf
```

Resume-only detail (month dates, locations, bullets, ranks, course codes) sits in a `resume` object on each entry in `experience.json` and `teaching.json`, and in `resume` in `site.json`. The public copy deliberately leaves out the home address, phone, personal email, clearance and patent application number; the full original stays in `private/`, which is git-ignored.

### The reading list

`/reading/` comes from Goodreads. Goodreads has no public API any more, so `src/lib/goodreads.ts` reads the RSS feeds for the `currently-reading`, `favorites` and `software-engineering` shelves (listed in `src/content.config.ts`) of the profile in `site.json` (`goodreads.userId`) at build time, and covers are downloaded and optimized then. The workflow rebuilds every night at 11:00 UTC, so a finished book shows up by the next morning; run the workflow by hand to update sooner. The profile must stay public. If Goodreads can't be reached the build fails rather than shipping an empty list, and the last deploy stays live.

## Tests

There are three suites: unit and integration tests on [Vitest](https://vitest.dev), and end-to-end tests on [Playwright](https://playwright.dev).

**Unit tests** live in `tests/unit/`, one file per source file, in the same folders as `src/` (`src/lib/posts.ts` is tested by `tests/unit/lib/posts.test.ts`). They use Astro's container API, so components and pages render exactly as they do in the build, without a server.

```sh
pnpm test              # run once (CI runs this before the build)
pnpm test:watch        # rerun on save
pnpm vitest run -u     # accept intended changes to snapshots
```

- Each test follows Arrange, Act, Assert, with the three steps marked in comments.
- Collections are mocked: `astro:content` serves fixtures from `tests/support/content.ts`, and Goodreads and remote covers are stubbed, so tests run offline and don't depend on the live shelves.
- The home page and resume render from the real JSON content and fail if a personal Gmail address, phone number, clearance, patent application number or street address appears (`tests/support/rules.ts`).
- Snapshots (`__snapshots__/`) cover stable markup: icons, header, footer, ledger, post list, book rows, the 404 page, the RSS feed and parsed Goodreads entries. Review a snapshot diff like any other change.
- Shared helpers and fixtures are in `tests/support/`.

**Integration tests** live in `tests/integration/`. They build the whole production site once (real content, the live Goodreads shelves, downloaded fonts) into a temporary folder, then check the output:

- every route is built, one page per published post and no drafts, each with a title, one `h1`, a description and a www canonical URL (the 404 and resume pages are `noindex` instead)
- every internal link, image, script and `#anchor` resolves to something in the build
- the RSS feed and sitemap list the right pages
- no published file breaks a content rule, and `hello@` is the only email address
- fonts, styles and covers are served from the site, with no third-party requests
- `staticwebapp.config.json` and `robots.txt` are deployed as intended
- `scripts/resume-pdf.mjs` prints a PDF (skipped when Chrome isn't installed)

```sh
pnpm test:integration                          # build into a temp folder, then test it
INTEGRATION_DIST=. pnpm test:integration       # test the existing dist/ instead
```

CI runs the integration tests against the exact `dist/` it is about to deploy.

**End-to-end tests** live in `tests/e2e/` (`*.spec.ts`, configured in `playwright.config.ts`). Playwright serves `dist/` with `astro preview` and drives it in Google Chrome at a desktop size (1280×800) and a phone size (Pixel 7), checking what only a browser can:

- the headline types through its phrases without changing height, and stays still with reduced motion
- the desktop nav and the phone menu, which closes after a link is followed
- the skip link, hero links, Projects button and contact address
- the reading list pages ten books at a time, and lists every book without JavaScript
- the writing archive jumps to a month, and posts open and link back
- missing URLs get the 404 page, and the resume PDF and feed download
- every page loads with no console errors, failed requests, broken images or horizontal scroll

```sh
pnpm build && pnpm resume && pnpm test:e2e         # against a local build
E2E_BASE_URL=https://www.jimmykurian.me pnpm test:e2e   # against the live site
```

The tests use the installed Chrome (`channel: 'chrome'`), so there's no browser download. A failing run keeps a trace in `test-results/` (`pnpm exec playwright show-trace <file>`); CI uploads it as an artifact.

## Checks

`task lint` runs every check; each one fails the build in CI, none only warn.

| Task | Checks | Config |
| --- | --- | --- |
| `lint:web` | `astro check`, ESLint (with accessibility rules for `.astro` markup), Prettier | `website/eslint.config.js`, `website/.prettierrc.json` |
| `lint:spelling` | cspell on posts, pages, docs and code | `.config/cspell.json`, words in `.config/cspell-words.txt` |
| `lint:markdown` | markdownlint on the `.md` files | `.config/.markdownlint-cli2.jsonc` |
| `lint:secrets` | gitleaks over the git history, including non-npm registry URLs | `.config/gitleaks.toml` |
| `lint:lockfile` | every locked package comes from registry.npmjs.org | |
| `lint:actions` | actionlint and zizmor on the workflows | |
| `lint:shell` | shellcheck on the scripts and hooks | |
| `lint:editorconfig` | every file against `.editorconfig` | `.config/editorconfig-checker.json` |
| `lint:commits` | commit messages (commitlint) | `.config/commitlintrc.json` |
| `infra:check` | `tofu fmt` and `validate`, TFLint, Checkov, provider pins | `infrastructure/` |

After `task build`, three more run against `dist/`:

- `task test:e2e` includes axe checks (WCAG 2.1 A and AA) on every page.
- `task lighthouse` fails below 0.95 for accessibility, 0.9 for SEO and best practices, or 0.8 for performance (the median of 3 runs; CI runners are noisy), or above 0.1 layout shift. `/resume/` is left out: it's the print source for the PDF, noindexed, with small contact links.
- `task lint:links` checks the external links with lychee (`.config/lychee.toml`). CI runs it nightly, after the deploy, so another site's outage doesn't block a push.

Prettier skips `.astro` and `.mdx` files: whitespace between inline elements renders in Astro templates, and Prettier's MDX support is MDX 1.

The git hooks check the staged files (secrets, spelling, formatting, ESLint, shellcheck, `tofu fmt`, actionlint) and the commit message. A check whose tool isn't installed is skipped with a warning; CI runs all of them.

Renovate (`.github/renovate.json`) updates npm packages, actions (pinned to commit SHAs), the OpenTofu provider and the `.mise.toml` tools on weekends, once a version is 7 days old.

## Deploy to Azure Static Web Apps

The Azure resources were set up in the portal with the steps below. `infrastructure/` has OpenTofu modules and tests for them, not yet used to deploy; see [infrastructure/README.md](infrastructure/README.md).

1. Push this repo to GitHub (`main` branch).
2. In the Azure portal, create a **Static Web App**, plan type **Free**. For the deployment source choose **Other** (the workflow in this repo does the build), or choose GitHub and then replace the generated workflow file with `.github/workflows/azure-static-web-apps.yml` from here.
3. Copy the app's **deployment token** (Overview, "Manage deployment token") and add it to the repo as a secret named `AZURE_STATIC_WEB_APPS_API_TOKEN` (Settings, Secrets and variables, Actions).
4. Push to `main`. The workflow runs the unit tests, builds `website/` with Node 22, runs the integration and end-to-end tests on the build, uploads `website/dist/`, and the site is live at the `*.azurestaticapps.net` address. Pull requests get their own preview environment, closed automatically when the PR closes.

`public/staticwebapp.config.json` sets the 404 page, trailing slashes, security headers and long-lived caching for hashed assets. It is copied into `dist/` by the build.

### Custom domain

1. In the Static Web App, **Custom domains**, add `www.jimmykurian.me` and follow the CNAME validation step, then add `jimmykurian.me` as the apex (TXT validation, then an ALIAS/ANAME or A record depending on the DNS host).
2. Set `www.jimmykurian.me` as the default domain so the apex redirects to it (or the reverse; `site` in `astro.config.mjs` should match whichever is canonical).
3. Point DNS at the new app, confirm the certificate shows as ready, then cancel the old about.me page.

## Structure

```text
.github/workflows/       lint, build, test and deploy (azure-static-web-apps.yml); infrastructure checks
.github/ISSUE_TEMPLATE/  bug, feature and subtask forms; PULL_REQUEST_TEMPLATE.md beside it
.github/renovate.json    dependency updates
.config/                 configs for the repo-wide checks (cspell, markdownlint, gitleaks, lychee, ...)
.githooks/               pre-commit and commit-msg hooks (task hooks:install)
.devcontainer/           devcontainer with the pinned tools, dependencies and Chrome
.vscode/extensions.json  recommended editor extensions
.mise.toml               tool versions
Taskfile.yml             every check, test and build step, by name
infrastructure/          OpenTofu modules for the Azure resources, not yet deployed from here
  modules/azure/           resource-group, and static-web-app with its custom domains
  tests/                   acceptance (one per module) and integration tofu tests, mocked provider
  scripts/                 run the module tests, check provider pins
AGENTS.md                project decisions for coding agents, Claude Code included
LICENSE                  proprietary, all rights reserved
SECURITY.md              how to report a vulnerability, and how the site is secured
CONTRIBUTING.md          setup, commits, signing, checks before pushing, content rules
CODE_OF_CONDUCT.md       Contributor Covenant 2.1, adapted
website/
  src/
    content.config.ts      collection schemas
    content/               experience, projects, writing, teaching, posts/
    data/site.json         profile, headline, focus areas, credentials
    layouts/Base.astro     head, fonts, header, footer, JSON-LD
    components/            Header, Footer, Ledger, Icon, PostList, WritingHero
    lib/posts.ts           post queries, tags, reading time, date formats
    lib/content.ts         JSON collections in file order
    lib/writing.ts         publications, patents and talks
    pages/                 index, writing/, writing/[id], rss.xml, 404
    styles/global.css      tokens, type, layout
  public/                  favicon, robots.txt, og-default.png, staticwebapp.config.json
  scripts/resume-pdf.mjs   prints /resume/ to dist/resume.pdf
  tests/unit/              Vitest unit tests, mirroring src/ one file per file
  tests/integration/       build the site, then test the output
  tests/e2e/               Playwright specs, in Chrome at desktop and phone sizes
  playwright.config.ts     Playwright: Chrome, preview server, projects
  tests/support/           render helper, content fixtures, image stub, content-rule patterns, dist readers
  vitest.config.ts         Vitest on Astro's Vite config
  private/                 full resume original (git-ignored, never published)
```

## Later

- Replace the two blog-link roots in `writing.json` with the actual article URLs.
- Per-post Open Graph images (generate at build time from the post title).
- Comments via Giscus on GitHub Discussions, once there are posts.
- Analytics: Microsoft Clarity or Cloudflare Web Analytics, one script tag in `Base.astro`.

## License

Proprietary. All rights reserved; see [LICENSE](LICENSE). Third-party packages, fonts and icons keep their own licenses.
