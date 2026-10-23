<!-- Copyright (c) 2026 Jimmy Kurian. All rights reserved. See LICENSE. Author: Jimmy Kurian. -->

# website

The Astro site behind [jimmykurian.me](https://www.jimmykurian.me). Paths here are relative to `website/`. The repo's architecture, principles and checks are in the [root README](../README.md), and the rules for coding agents in [AGENTS.md](AGENTS.md).

## Run it

Set up the tools from the repo root first (`mise install`, `task install`; see [CONTRIBUTING.md](../CONTRIBUTING.md#getting-started)), then:

```sh
pnpm dev               # http://localhost:4321
pnpm build             # static output in dist/ (fetches the Goodreads feeds)
pnpm preview           # serve dist/ locally
pnpm resume            # print /resume/ to dist/resume.pdf (after a build)
pnpm check             # type-check .astro and .ts files (astro check)
pnpm lint              # ESLint and Prettier; pnpm format fixes what it can
pnpm test              # unit tests (Vitest); test:coverage adds the coverage thresholds
pnpm test:integration  # builds the site, then runs the Cucumber features on it
pnpm test:e2e          # Playwright in Chrome, against dist/ (build first)
```

From the repo root, the same steps run as tasks: `task lint:web`, `task test`, `task build`, `task test:integration`, `task test:e2e` and `task lighthouse`.

## Where the content lives

Everything on the site is data; the pages just render it. Edit these and the build picks it up:

| What                                                           | File                                                                        |
| -------------------------------------------------------------- | --------------------------------------------------------------------------- |
| Headline, intro, links, focus areas, education, certifications | `src/data/site.json`                                                        |
| Experience and Guard service                                   | `src/content/experience.json`                                               |
| Selected work                                                  | `src/content/projects.json`                                                 |
| Publications, patent, talks                                    | `src/content/writing.json` (`featured: true` puts an item on the home page) |
| Teaching, speaking, community                                  | `src/content/teaching.json`                                                 |
| Blog posts                                                     | `src/content/posts/*.mdx`                                                   |
| Resume download                                                | generated: `src/pages/resume.astro` prints to `dist/resume.pdf`             |
| Portrait                                                       | `src/assets/portrait.jpg` (replace the file; Astro resizes it at build)     |

Schemas are in `src/content.config.ts`. A missing field or a bad date fails the build rather than shipping. Entries in the JSON files render in the order they appear in the file.

Fonts (Newsreader, Libre Franklin) are configured in `astro.config.mjs` and downloaded at build time, so the live site makes no requests to Google.

### Writing a post

Create `src/content/posts/my-post.mdx`:

```mdx
---
title: 'Post title'
description: 'One or two sentences. Shows in the list, the feed, and link previews.'
pubDate: 2026-11-01
tags: ['AI-assisted development', 'Leadership']
draft: false
---

Body in Markdown. MDX, so components work too.
```

- `draft: true` keeps a post visible in `pnpm dev` but out of the production build. It's still readable in the public repo, so keep early drafts in `private/`.
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

`/reading/` comes from Goodreads. Goodreads has no public API any more, so `src/lib/goodreads.ts` reads the RSS feeds for the `currently-reading`, `favorites` and `software-engineering` shelves (listed in `src/content.config.ts`) of the profile in `site.json` (`goodreads.userId`) at build time, and covers are downloaded and optimized then. The workflow rebuilds every night at 11:00 UTC, so a finished book shows up by the next morning; run the workflow by hand to update sooner. The profile must stay public. Goodreads sometimes answers with a brief 5xx, so each feed request is retried twice (after 0.3s and 0.6s, or the server's `Retry-After`, up to 10s) on a 5xx, 408, 429 or network error. If Goodreads still can't be reached the build fails rather than shipping an empty list, and the last deploy stays live.

## Tests

There are three suites: unit tests on [Vitest](https://vitest.dev), integration tests as [Cucumber](https://github.com/cucumber/cucumber-js) behavior specs, and end-to-end tests on [Playwright](https://playwright.dev).

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

**Integration tests** live in `tests/integration/`, written in Gherkin: each `features/*.feature` file is one area, with scenarios that read as plain sentences, and `steps/*.steps.ts` holds the step definitions. They build the whole production site once (real content, the live Goodreads shelves, downloaded fonts) into a temporary folder, then check the output:

- every route is built, one page per published post and no drafts, each with a title, one `h1`, a description and a www canonical URL (the 404 and resume pages are `noindex` instead)
- every internal link, image, script and `#anchor` resolves to something in the build, and every page with the footer links the source repository
- the RSS feed and sitemap list the right pages
- no published file breaks a content rule, and `hello@` is the only email address
- fonts, styles and covers are served from the site, with no third-party requests
- `staticwebapp.config.json` and `robots.txt` are deployed as intended
- `scripts/resume-pdf.mjs` prints a PDF (tagged `@chrome`, and skipped when Chrome isn't installed)

```sh
pnpm test:integration                          # build into a temp folder, then test it
INTEGRATION_DIST=. pnpm test:integration       # test the existing dist/ instead
pnpm test:integration --tags @feeds            # run one feature by its tag
```

CI runs the integration tests against the exact `dist/` it is about to deploy, and counts passed scenarios from the JSON report in `reports/integration.json`.

**End-to-end tests** live in `tests/e2e/` (`*.spec.ts`, configured in `playwright.config.ts`). Playwright serves `dist/` with `astro preview` and drives it in Google Chrome at a desktop size (1280×800) and a phone size (Pixel 7), checking what only a browser can:

- the headline types through its phrases in a loop without changing height, pauses and resumes from its button, and stays still with reduced motion
- the desktop nav and the phone menu, which closes after a link is followed
- the skip link, hero links, Projects button and contact address
- the reading list pages ten books at a time, and lists every book without JavaScript
- the writing archive jumps to a month, and posts open and link back
- missing URLs get the 404 page, and the resume PDF and feed download
- every page loads with no console errors, failed requests, broken images or horizontal scroll, and with no WCAG 2.0, 2.1 or 2.2 A or AA violations (axe)

```sh
pnpm build && pnpm resume && pnpm test:e2e         # against a local build
E2E_BASE_URL=https://www.jimmykurian.me pnpm test:e2e   # against the live site
```

The tests use the installed Chrome (`channel: 'chrome'`), so there's no browser download. A failing run keeps a trace in `test-results/` (`pnpm exec playwright show-trace <file>`); CI uploads it as an artifact.

## Releases

Release Please versions the site from the Conventional Commits on `main` that change `website/`, in `package.json` and `CHANGELOG.md`, and tags each release `website-v<version>`. See [CONTRIBUTING.md, Releases](../CONTRIBUTING.md#releases).

## Layout

```text
src/
  content.config.ts      collection schemas
  content/               experience, projects, writing, teaching, posts/
  data/site.json         profile, headline, focus areas, credentials, the repository URL
  layouts/Base.astro     head, fonts, header, footer, JSON-LD
  components/            Header, Footer, Ledger, Icon, PostList, WritingHero, BookRows
  lib/                   posts, JSON collections in file order, writing, Goodreads
  pages/                 index, writing/, writing/[id], reading, resume, rss.xml, 404
  styles/global.css      tokens, type, layout
public/                  favicon, robots.txt, og-default.png, staticwebapp.config.json
scripts/resume-pdf.mjs   prints /resume/ to dist/resume.pdf
scripts/check-licenses.mjs  checks the installed packages' licenses (task lint:licenses)
tests/unit/              Vitest unit tests, mirroring src/ one file per file
tests/integration/       Cucumber features and steps: build the site, then test the output
tests/e2e/               Playwright specs, in Chrome at desktop and phone sizes
tests/support/           render helper, content fixtures, image stub, content-rule patterns, dist readers
astro.config.mjs         site URL, integrations, fonts
eslint.config.js         ESLint: TypeScript, Astro and accessibility rules
.prettierignore          what Prettier skips (.astro, .mdx); the config is ../.config/formatters/prettierrc.json
stylelint.config.mjs     Stylelint: BEM class names, Astro style blocks
knip.jsonc               knip: dead code, and the tools run from the repo root
typedoc.json             TypeDoc: builds docs/ from the TSDoc comments in src/
tsdoc.json               the TSDoc tags (TypeDoc's), checked by ESLint's tsdoc/syntax
docs/                    the generated API docs (task docs; CI fails if they're stale)
playwright.config.ts     Playwright: Chrome, preview server, projects
vitest.config.ts         Vitest on Astro's Vite config, with coverage thresholds
package.json             scripts and dependencies; pnpm is pinned by packageManager
pnpm-workspace.yaml      dependency overrides and audit exceptions, each with a reason
AGENTS.md                rules for coding agents working in website/
private/                 full resume original (git-ignored, never published)
```
