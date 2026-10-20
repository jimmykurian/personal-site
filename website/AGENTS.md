# website/

The jimmykurian.me site: Astro 7 with static output, TypeScript, MDX and content collections. The repo-wide rules are in [../AGENTS.md](../AGENTS.md); this file covers working inside `website/`. Paths here are relative to `website/`.

## Map

- `src/pages/`: the routes: home, `/writing/`, posts, `/reading/`, `/resume/`, the 404 page and the RSS feed.
- `src/components/` and `src/layouts/Base.astro`: the shared markup (head, header, footer, JSON-LD).
- `src/content/` and `src/data/site.json`: the content. Posts are MDX in `src/content/posts/<slug>/`. The rest is JSON. [README.md](README.md#where-the-content-lives) says what lives where.
- `src/lib/goodreads.ts`: builds `/reading/` from the Goodreads shelf RSS feeds at build time (no API). It retries a brief 5xx, rate limit or network error twice; if Goodreads still fails, the build fails, so the last deploy stays live.
- `scripts/resume-pdf.mjs`: prints `/resume/` to `dist/resume.pdf` with the installed Chrome.
- `scripts/check-licenses.mjs`: checks every installed package's license against `../.config/licenses/` (`task lint:licenses`).
- `tests/`: `unit/` (Vitest with Astro's container API), `integration/` (checks the built `dist/`), `e2e/` (Playwright), and `support/` (shared helpers).

## Working here

- Use pnpm only, never npm, and never commit a `package-lock.json`. Use no client framework. Keep scripts small and inline, and have each one respect `prefers-reduced-motion` when it animates.
- Every source change updates its matching unit test. `tests/unit/` mirrors `src/`, one test file per source file, written as Arrange, Act, Assert with the steps marked in comments. Keep tests offline: stub `fetch`, and mock `astro:content` with the helpers in `tests/support/`. Coverage thresholds in `vitest.config.ts` only go up.
- Add an integration check in `tests/integration/` when a change affects what gets published: a page, file, header or rule.
- Anything that needs a real browser goes in `tests/e2e/`: scripts, focus, layout. It runs in installed Chrome (`channel: 'chrome'`) at desktop and phone sizes.
- Prettier doesn't format `.astro` or `.mdx`. Whitespace between inline elements renders, so check spacing by hand, and check it on the page.
- Verify with `task lint`, `task test`, `task build`, then `task test:integration` and `task test:e2e`. The commands and test helpers are in [../CONTRIBUTING.md](../CONTRIBUTING.md#tests).

## Design

- Editorial direction: Newsreader for the display serif and the italic wordmark, Libre Franklin for body text and UI.
- A ruled "ledger" layout: a heavy rule, a small-caps label column on the left, content on the right. No cards, pills, numbered sections or monospace eyebrows.
- The palette is Sanzo Wada's combination 207 on white, with tokens at the top of `src/styles/global.css`. Use the tokens, not new colors. `#8f5a47` is the accent for small text.
- The mockup is the Design canvas "jimmykurian.me redesign", with three artboards: home (desktop), writing (desktop) and home (phone).

## Content

- Posts are published here first, then syndicated with a canonical link back. `draft: true` keeps a post out of production builds, but it's still public in the repo.
- `/resume/` and `/resume.pdf` are built from the site data. The content rules in the root AGENTS.md apply to both, and `tests/integration/` checks them across every published file.
