# jimmykurian.me

Personal site. This file records the decisions already made; follow them unless told otherwise.

## Stack and hosting

- The site lives in `website/`: run pnpm there (pinned with `packageManager` in `package.json`; the lockfile is `pnpm-lock.yaml`, never npm or a `package-lock.json`). File paths in this document are relative to `website/`. The repo root holds only this file, `README.md`, `LICENSE`, `SECURITY.md`, `CONTRIBUTING.md`, `CODE_OF_CONDUCT.md`, `.github/`, `infrastructure/`, the tooling (`.mise.toml`, `Taskfile.yml`, `.config/`, `.githooks/`, `.devcontainer/`, `.vscode/extensions.json`) and the git and editor config (`.gitignore`, `.gitattributes`, `.gitmessage`, `.editorconfig`). Claude Code reads this file directly (no `CLAUDE.md`).
- Astro 7.x, static output, TypeScript, MDX, content collections.
- No client framework. Add islands only if a feature needs one later.
- `/reading/` is built from the Goodreads shelf RSS feeds (no API) by the loader in `src/lib/goodreads.ts`. The workflow rebuilds nightly to pick up changes. If Goodreads is unreachable the build fails, so the last deploy stays live.
- Hosted on Azure Static Web Apps (Free plan): app `jimmykurian-me` in resource group `rg-personal-site` (East US 2), in the personal Azure subscription ("Azure subscription 1", personal directory). Default host: `yellow-flower-092ce0d0f.3.azurestaticapps.net`. The deploy token is the repo secret `AZURE_STATIC_WEB_APPS_API_TOKEN`.
- Unit tests: Vitest with Astro's container API, in `tests/unit/`, mirroring `src/` one test file per source file. Follow Arrange, Act, Assert with the steps marked in comments, mock `astro:content` with the helpers in `tests/support/`, and keep tests offline. Add or update the matching test with every source change. CI runs them with coverage (`task test`) before the build; the thresholds in `vitest.config.ts` only go up.
- Integration tests: `tests/integration/` builds the production site once (`setup.ts`) and checks the output in `dist/` (routes, links and anchors, feeds, content rules across every file, assets, deploy config, the resume PDF). CI runs `pnpm test:integration` against the `dist/` it deploys. Add a check here when a change affects what gets published.
- End-to-end tests: Playwright in `tests/e2e/` (`*.spec.ts`), against `dist/` served by `astro preview`, in the installed Google Chrome (`channel: 'chrome'`, no browser download) at desktop and phone sizes. They cover browser behavior: scripts (typing headline, reading-list paging, phone menu), navigation, and clean page loads. Set `E2E_BASE_URL` to test the live site. CI runs `pnpm test:e2e` after the integration tests.
- `infrastructure/` holds OpenTofu modules for the Azure resources (`modules/azure/resource-group`, `modules/azure/static-web-app`), with no Terragrunt, environments or generated docs yet: nothing there deploys yet, and the live resources were made in the portal. Use `tofu`, never `terraform`, and `azurerm` from the OpenTofu registry (`registry.opentofu.org/hashicorp/azurerm`, pinned `~> 5.8.0` in every module, lock files committed; `scripts/check-provider-pins.sh` keeps the pins equal). Modules stay generic; the site's values belong to whatever deploys them. Tests live in `tests/acceptance/<group>/<module_name>.tftest.hcl` (one per module) and `tests/integration/<topic>/` (first line `# module: <group>/<module>`), use a mocked provider, follow Arrange, Act, Assert, and run with `scripts/run-module-tests.sh`. Add or update the matching test with every module change. DNS stays at Namecheap, outside it.
- The repository is public (`github.com/jimmykurian/personal-site`, linked as "Source" in the footer from `repository` in `src/data/site.json`) but proprietary, and Jimmy is its only contributor: no outside pull requests or issues. Everything committed is readable, drafts included, so early drafts stay in `private/`.
- Built in GitHub Actions, then uploaded with `Azure/static-web-apps-deploy` using `skip_app_build: true`. PR preview environments are on. A `lint` job gates the build, and the nightly run checks external links after the deploy.
- Checks and tooling:
  - Tool versions live only in `.mise.toml` (Node included; pnpm stays pinned by `packageManager`), and every command lives in `Taskfile.yml`. CI and the git hooks call those tasks, never the tools directly, so local and CI runs match.
  - Every check fails the build. Don't add advisory checks (`|| true`, `continue-on-error`, warn-only); fix the finding or skip it inline with a reason.
  - Repo-wide configs go in `.config/`; the website's own (ESLint, Prettier) stay in `website/`. Prettier skips `.astro` (inline whitespace renders) and `.mdx`.
  - Actions are pinned to full commit SHAs with a `# vX.Y.Z` comment; Renovate updates them, the npm packages, the provider and the mise tools once a version is 7 days old.
  - New words for cspell go in `.config/cspell-words.txt`; new commit scopes go in both `.gitmessage` and `.config/commitlintrc.json`.
  - Packages come only from registry.npmjs.org. If it's unreachable locally, resolve lockfile changes in CI; `task lint:lockfile` and gitleaks block other registries.
- Domain registered and DNS hosted at Namecheap (BasicDNS); no Cloudflare. `www` is a CNAME to the app's default host, and the apex is an ALIAS to the same host (verified with a TXT record). `www` is the canonical host, and the apex redirects to it once `www` is the default domain in Azure.
- The old site is an about.me page. Cancel it after the DNS cutover.

## Commits

- Messages follow Conventional Commits 1.0.0 (`feat(scope): …`, `fix`, `docs`, `ci`, `refactor`, `chore`). `.gitmessage` at the root is the template (`git config commit.template .gitmessage`) and lists the scopes.
- `main` takes changes only through pull requests, merged with squash (the PR title, in Conventional Commits form, becomes the commit). The "Protect main" ruleset requires signed commits, linear history, passing CI and CodeQL, and a Copilot review, and blocks force-pushes and deletion.
- Commits are signed with SSH (this repo's git config sets `commit.gpgsign`), so GitHub shows them as Verified. Don't pass `--no-gpg-sign`.

## Design

- Editorial direction. Newsreader for the serif display and the italic wordmark; Libre Franklin for body text and UI.
- Ruled "ledger" layout: a heavy rule, a small-caps label column on the left and content on the right.
- Don't use cards, pills, numbered sections or monospace eyebrows.
- Palette is Sanzo Wada, *A Dictionary of Color Combinations*, combination 207, on white:
  - Black `#111314`: type, rules, buttons
  - Sudan Brown `#a36752`: accent. Use `#8f5a47` for small text.
  - Glaucous Green `#b4cdc2`: hairlines, the credentials band, the portrait frame
- The mockup is on the Design canvas "jimmykurian.me redesign". It has three artboards: home (desktop), writing (desktop) and home (phone).

## Content rules

- Client names stay anonymized, as they are on the resume.
- The clearance level and the patent application number are left off the public site on purpose.
- The operating-model redesign is listed as co-authored, with no claim that it was adopted.
- Writing is published on this site first, then syndicated with canonical links back here.
- Blog posts are MDX files in `src/content/posts/`. Drafts are excluded from production builds.
- The public resume (`/resume.pdf`) is generated from the site data by printing `/resume/`. It has no home address, phone, personal email, clearance or patent application number. The full original lives in `private/` (git-ignored) and is never published.
- The public contact address is `hello@jimmykurian.me`, never the personal Gmail.

## Open items

- Real URLs for the ISE blog posts and the InfoQ article.
- Namecheap Mail Settings → Email Forwarding, with `hello` forwarding to the personal Gmail. The site already shows `hello@`, so this must work before launch.
- Later: per-post OG images, Giscus comments, and Clarity or Cloudflare analytics.
