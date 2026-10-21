<!-- Copyright (c) 2026 Jimmy Kurian. All rights reserved. See LICENSE. Author: Jimmy Kurian. -->

# Contributing

This is the source of my personal site, [jimmykurian.me](https://www.jimmykurian.me).
The repository is public so you can see how the site is built, but it's
[proprietary](LICENSE) and I'm its only contributor. I don't accept pull
requests, issues or patches from anyone else; pull requests from forks are
closed without review. Reading the code doesn't grant a license to reuse it.

If you spot a typo, a broken link or something that looks wrong, email
<hello@jimmykurian.me>. Security issues go through [SECURITY.md](SECURITY.md).

The rest of this file is how I (and any coding agent working with me) make
changes here.

## Table of contents

- [Code of conduct](#code-of-conduct)
- [Getting started](#getting-started)
- [AI-assisted development](#ai-assisted-development)
- [Workflow](#workflow)
- [Commits](#commits)
- [Quality checks](#quality-checks)
- [Before you push](#before-you-push)
- [Tests](#tests)
- [Deploys](#deploys)
- [Releases](#releases)
- [Content rules](#content-rules)
- [Design rules](#design-rules)

## Code of conduct

Follow the [Code of Conduct](CODE_OF_CONDUCT.md).

## Getting started

**Prerequisites:**

- [mise](https://mise.jdx.dev), which installs Node, OpenTofu, Task and the
  linters at the versions in `.mise.toml`. Or open the devcontainer, which has
  everything.
- pnpm, at the version pinned by `packageManager` in `website/package.json`.
  With Node's Corepack, `corepack enable` installs it on first use. Don't use
  npm or commit a `package-lock.json`; the lockfile is `pnpm-lock.yaml`.
- Google Chrome, only for `pnpm resume` (set `CHROME_PATH` if it isn't in
  the usual place)

**Setup:**

```sh
git clone https://github.com/jimmykurian/personal-site.git
cd personal-site
git config commit.template .gitmessage

mise install
task install         # the website's dependencies
task hooks:install   # pre-commit, commit-msg and pre-push hooks

cd website
pnpm dev        # http://localhost:4321
```

Other commands, run from `website/`:

```sh
pnpm build         # static output in dist/ (fetches the Goodreads feeds)
pnpm preview       # serve dist/ locally
pnpm resume        # print /resume/ to dist/resume.pdf (after a build)
pnpm check        # type-check .astro and .ts files (astro check)
pnpm lint         # ESLint and Prettier; pnpm format fixes what it can
pnpm test          # unit tests (Vitest); pnpm test:watch reruns on save
pnpm test:integration  # build the site, then run the Cucumber features on it
pnpm test:e2e      # Playwright in Chrome against dist/ (after pnpm build)
```

`website/README.md` explains where each piece of content lives. Your editor should pick
up `.editorconfig` (2 spaces, LF, final newline); `.gitattributes` keeps line
endings LF on every OS.

## AI-assisted development

Coding agents (Claude Code, Codex, Copilot) read three AGENTS.md files.
There's deliberately no `CLAUDE.md`, since Claude Code reads `AGENTS.md` directly.

- [AGENTS.md](AGENTS.md) at the root holds only what applies to every task:
  the map, how to work and verify, hosting and the content rules.
- [website/AGENTS.md](website/AGENTS.md) and
  [infrastructure/AGENTS.md](infrastructure/AGENTS.md) cover their own
  subprojects.

Keep them short. Each line is read on every task, so point to `README.md` or
`CONTRIBUTING.md` for detail instead of copying it, and leave style to the
linters. When a decision changes, update the AGENTS.md it belongs in, in the
same commit.

## Workflow

Every change goes through a pull request; `main` doesn't take direct pushes:

- Work on a short-lived branch, keep each commit to one change, and open a PR
  to `main` with the [template](.github/PULL_REQUEST_TEMPLATE.md) filled in.
- The workflow deploys each PR to its own preview URL and removes it when the
  PR closes.
- PRs merge with squash, so the PR title becomes the commit on `main`: it
  follows Conventional Commits like any other commit message. CI checks the
  title with commitlint (`task lint:pr-title`) and the body against the
  template (`task lint:pr-template`), labels the PR by the paths it changes
  (`.github/labeler.yml`), and assigns it to whoever opened it (the owner for
  a bot's PR, except a release PR; see [Releases](#releases)).
- Merging needs the CI checks, CodeQL and a Copilot review to pass. The
  ruleset requires the **Title**, **Template**, **Repository**, **Website**,
  **Infrastructure** and **CodeQL** checks by name; a job skipped because its
  files didn't change counts as passed. Auto-merge is on, and merged branches
  are deleted. `main` keeps a linear history of signed commits, and can't be
  force-pushed or deleted.
- Rebase the branch onto `main` rather than merging it in (`git pull --rebase`).

## Commits

Messages follow [Conventional Commits 1.0.0](https://www.conventionalcommits.org/en/v1.0.0/):

```text
<type>(<scope>): <description>

[optional body]

[optional footer(s)]
```

- **Types:** `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`,
  `build`, `ci`, `chore`
- **Scopes (optional):** `home`, `writing`, `reading`, `resume`, `links`,
  `footer`, `seo`, `swa`, `infra`, `content`, `styles`, `deps`, `docs`,
  `tooling`
- **Description:** present tense, lowercase, no period

```text
feat(reading): add a favorites shelf
fix(swa): stop redirecting /resume.pdf to /resume.pdf/
docs: update README with setup instructions
```

`.gitmessage` is the template with the full list; `git config commit.template
.gitmessage` turns it on. The `commit-msg` hook and CI check messages with
commitlint (`.config/commitlintrc.json`).

### Signed commits

Every commit is signed with an SSH key, so GitHub shows it as Verified. Don't
pass `--no-gpg-sign`. To set it up on a new machine:

```sh
git config gpg.format ssh
git config user.signingkey ~/.ssh/id_ed25519.pub
git config commit.gpgsign true
git config tag.gpgsign true

# lets `git log --show-signature` verify locally
echo "$(git config user.email) $(cat ~/.ssh/id_ed25519.pub)" > .git/allowed_signers
git config gpg.ssh.allowedSignersFile .git/allowed_signers

# add the same public key to GitHub as a signing key
gh ssh-key add ~/.ssh/id_ed25519.pub --type signing --title "<machine> signing"
```

`git log -1 --format='%G?'` prints `G` for a good signature.

## Quality checks

`task lint` runs every check below: `lint:repo`, `lint:web` and `infra:check` run each group. `task test`, `task build`, `task test:integration`, `task test:e2e` and `task lighthouse` cover the rest.

**Repository** (`task lint:repo`):

| Task | Checks | Config |
| --- | --- | --- |
| `lint:headers` | every file starts with the copyright and author header, and any `@file` tag names its own file | `.config/linters/headers-exclude.txt` (exceptions) |
| `lint:secrets` | gitleaks over the git history, including non-npm registry URLs | `.config/linters/gitleaks.toml` |
| `lint:secretlint` | secretlint's recommended rules over the tracked files, with secrets masked in the output | `.config/linters/secretlintrc.json` |
| `lint:lockfile` | the lockfile: packages from registry.npmjs.org only, sha512 hashes only, no git dependencies, an upper bound on every override range, no npm or Yarn lockfile | |
| `lint:dedupe` | no duplicate versions in the lockfile that pnpm could merge | |
| `lint:audit` | no high or critical advisories (`pnpm audit`) | `website/pnpm-workspace.yaml` |
| `lint:osv` | OSV-Scanner checks the lockfile against the OSV database, every severity | `.config/linters/osv-scanner.toml` |
| `lint:licenses` | every installed package's license is on the allowed list, or the package is excluded with a reason | `.config/licenses/` |
| `lint:actions` | actionlint and zizmor on the workflows | |
| `lint:shell` | shellcheck on the scripts and hooks | |
| `lint:editorconfig` | every file against `.editorconfig` | `.config/linters/editorconfig-checker.json` |
| `lint:markdown` | markdownlint on the `.md` files | `.config/linters/.markdownlint-cli2.jsonc` |
| `lint:spelling` | cspell on posts, pages, docs and code | `.config/spelling/cspell.json`, words in `.config/spelling/words.txt` |
| `lint:inclusive-language` | alex on the docs, posts and site content, for insensitive or inconsiderate wording | `.alexrc.yml` (allow list) |
| `lint:yaml` | yamllint on the YAML files | `.config/linters/yamllint.yml` |
| `lint:schemas` | v8r validates the JSON, YAML and TOML configs against their published schemas | `.config/linters/v8rrc.yml` |
| `lint:commits` | commit messages (commitlint) | `.config/commitlintrc.json` |
| `lint:pr-title` | a pull request title, which becomes the squash commit (commitlint) | `.config/commitlintrc.json` |
| `lint:pr-template` | a pull request body keeps every template section and replaces its instructions | `.github/PULL_REQUEST_TEMPLATE.md` |

**Website** (`task lint:web`):

| Task | Checks | Config |
| --- | --- | --- |
| `lint:astro` | `astro check` type-checks `.astro` and `.ts` files | `website/tsconfig.json` |
| `lint:eslint` | ESLint, with accessibility rules for `.astro` markup | `website/eslint.config.js` |
| `lint:format` | Prettier | `.config/formatters/prettierrc.json`, through `prettier` in `website/package.json` |
| `lint:css` | Stylelint on `src/styles/` and `.astro` style blocks | `website/stylelint.config.mjs` |
| `lint:dead-code` | knip: unused files, exports and dependencies | `website/knip.jsonc` |
| `docs:check` | the TypeDoc API docs in `website/docs/` match the TSDoc comments (`task docs` regenerates them) | `website/typedoc.json`, `website/tsdoc.json` |

**Infrastructure** (`task infra:check`): `infra:fmt`, `infra:validate`, `infra:tflint`, `infra:checkov` and `infra:pins`, then `infra:test` for the module tests. `infra:docs:check` fails if the terraform-docs pages in `infrastructure/docs/` are out of date; `task infra:docs` regenerates them.

After `task build`, three more run against `dist/`:

- `task test:e2e` includes the axe checks on every page.
- `task lighthouse` fails below 0.95 for accessibility, 0.9 for SEO and best practices, or 0.8 for performance (the median of 3 runs; CI runners are noisy), or above 0.1 layout shift. `/resume/` is left out: it's the print source for the PDF, noindexed, with small contact links.
- `task lint:links` checks the external links with lychee (`.config/linters/lychee.toml`). CI runs it nightly, after the deploy, so another site's outage doesn't block a push.

Prettier skips `.astro` and `.mdx` files: whitespace between inline elements renders in Astro templates, and Prettier's MDX support is MDX 1.

The git hooks in `.githooks/` are plain bash, so they need no `node_modules`:

- **pre-commit:** checks the staged files (secrets with gitleaks and secretlint, the lockfile, spelling, inclusive language, formatting, ESLint, Stylelint, yamllint, shellcheck, `tofu fmt`, actionlint) and refuses commits on `main`.
- **commit-msg:** checks the message against Conventional Commits.
- **pre-push:** refuses pushes to `main`, or deleting it. It runs the unit tests if `website/` changed and the module tests if `infrastructure/` changed, on the working tree, so it refuses the push when the working tree isn't the pushed commit.

A check whose tool isn't installed is skipped with a warning. CI runs all of them, plus the build, e2e and Lighthouse.

On a pull request, CI (`.github/workflows/ci.yml`) posts one comment with a table of every check's result for the Website, Infrastructure and Repository, with the coverage and test counts, and updates it on each push. The website and infrastructure checks run only when their files change.

Renovate (`.github/renovate.json`) handles version updates for the npm packages, the actions, the OpenTofu provider and the `.mise.toml` tools: once a week, grouped into one pull request for minor and patch updates, one for majors and one for the provider. Dependabot (`.github/dependabot.yml`) handles security updates only, as soon as an advisory lands, grouped per ecosystem. On each pull request, GitHub's dependency review fails a change that adds a dependency with a known advisory.

Release Please (`.github/workflows/release-please.yml`) keeps a release PR open that bumps the version and `CHANGELOG.md` of `website/` and `infrastructure/` from the Conventional Commits since their last release. Merging it tags each package and publishes a GitHub Release. See [Releases](#releases).

## Before you push

The pre-push hook runs `task test` when `website/` changed and `task infra:test`
when `infrastructure/` changed, and refuses pushes to `main` or deleting it. The
tests run on the working tree, so push the checked-out branch with no
uncommitted changes under `website/` or `infrastructure/`. The rest is up to you:

- [ ] `task lint`, `task test`, `task test:integration` and `task test:e2e`
      pass (the last two after `task build`)
- [ ] Each changed source file has its matching test in `tests/unit/` updated, and any
      snapshot changes are intended
- [ ] Changed pages look right in a browser at desktop and phone widths, with
      no horizontal scroll
- [ ] New posts render in `pnpm preview`, and `draft: true` is removed when
      they're ready
- [ ] Nothing from `private/`, no `.env` file and no secret is staged
- [ ] Nothing staged is unready to share: the repository is public, so a
      committed draft is readable before it's published. Keep early drafts in
      `private/` until they're ready
- [ ] The content rules below hold
- [ ] `pnpm-lock.yaml` changes only with a deliberate dependency change
- [ ] `AGENTS.md` and `README.md` are updated if a decision or a command changed
- [ ] Commit messages follow Conventional Commits and the commits are signed

## Tests

`tests/unit/` mirrors `src/`: every component, layout, page and module has one test file at
the same path (`src/components/Header.astro` → `tests/unit/components/Header.test.ts`).

- Write each test as Arrange, Act, Assert, with `// Arrange`, `// Act` and `// Assert`
  comments.
- Render components and pages with `render()` from `tests/support/container.ts`, and query
  the result with `dom()`.
- Mock `astro:content` and serve fixtures with `collectionStub()` and the `post()`,
  `book()` and `writingItem()` factories, or `realEntries()` for the actual JSON content.
- Tests stay offline: stub `fetch` for Goodreads, and use `stubRemoteImages()` for covers.
- Snapshot only stable markup, normalized with `normalize()`. Update snapshots with
  `pnpm vitest run -u` when a change is intended.

`tests/integration/` tests the built site instead, as behavior specs run by
[Cucumber](https://github.com/cucumber/cucumber-js) (`tests/integration/cucumber.mjs`):

- Each `features/*.feature` file describes one area in Gherkin: a `Feature` with its
  "So that, As, I want" story, a `Background` of `Given the production build of the site`,
  and `Scenario`s (or a `Scenario Outline` with `Examples`) that read as plain sentences.
- `steps/*.steps.ts` holds the step definitions. `Given`, `When` and `Then` are Arrange,
  Act and Assert: a `When` step stores what it found with `this.remember()`, and its `Then`
  steps read it back with `this.recall()` (`support/world.ts`). Assert with
  `node:assert/strict`, and collect every failure into one `deepEqual` so a report names
  them all.
- `support/hooks.ts` runs a production build into a temporary folder once (or uses the
  `dist/` named by `INTEGRATION_DIST`), and the steps read it through
  `tests/support/dist.ts`. Tag a scenario `@chrome` when it needs a local Chrome; it's
  skipped without one.
- The suite fails on an undefined or pending step (`strict`). It needs the network, since
  the build reads Goodreads and downloads the fonts.

When a change affects what gets published (a new page, file, header or rule), add a
scenario there, reusing an existing step where one fits.

`tests/e2e/` holds the Playwright specs. They import `test` and `expect` from
`tests/e2e/fixtures.ts`, which fails a test on console errors, uncaught exceptions and
failed requests. Write them as Arrange, Act, Assert too, and prefer role-based locators
(`getByRole`). Use `test.skip` with `isPhone(page)` for checks that only apply at one size.
Anything that needs a real browser belongs here: scripts, focus, scrolling, layout.

## Deploys

`.github/workflows/ci.yml` runs every check and deploys. Three jobs run side by
side, each check as its own step:

- **Repository:** the repo-wide checks (`task lint:repo`) and the commit messages.
- **Website:** the website's lint tasks, the unit tests with coverage, the build
  and resume PDF, and the integration, end-to-end and Lighthouse checks on the
  build.
- **Infrastructure:** `task infra:check`'s checks and the module tests.

On a pull request, the website and infrastructure jobs run only when their files
change. A **Check table** job then posts one comment on the PR with each check's
result and the coverage and test counts, and updates it on every push. When
every job passes, the deploy uploads `website/dist/` to Azure Static Web Apps:

| Trigger            | Result                                         |
| ------------------ | ---------------------------------------------- |
| Push to `main`     | Production deploy                              |
| Pull request       | Preview environment, closed when the PR closes |
| Nightly, 11:00 UTC | Rebuild so `/reading/` picks up Goodreads, then check external links |
| Manual dispatch    | Rebuild on demand                              |

If Goodreads can't be reached, the build fails and the last deploy stays live.
Re-run the workflow once it's back.

`infrastructure/` holds OpenTofu modules for the Azure resources, with their
tests; they aren't deployed from there yet. Run `task infra:check` and
`task infra:test` before you push a change there.

## Releases

[Release Please](https://github.com/googleapis/release-please)
(`.github/workflows/release-please.yml`) versions `website/` and
`infrastructure/` separately, from the Conventional Commits on `main`:

- After each merge it opens or updates one release PR, `chore: release main`,
  from the App's bot. The PR is assigned to that bot and requests Jimmy's
  review (`.github/workflows/pr-assign-author.yml`).
  It bumps the version of each package that changed and adds the commits to
  that package's `CHANGELOG.md`. `website/` takes its version from
  `package.json`; `infrastructure/` from `version.txt`.
- A `fix` is a patch release and a `feat` a minor one, and a `!` or
  `BREAKING CHANGE` footer is a major one (a minor one while a version is below
  1.0). `docs` and `refactor` commits are listed too; `chore`, `ci`, `build`,
  `test` and `style` aren't.
- A commit counts for a package only if it changes files in that folder, so
  changes to the root tooling alone never make a release.
- Merging the release PR tags each package (`website-v1.1.0`,
  `infrastructure-v0.2.0`) and publishes a GitHub Release. A release doesn't
  deploy anything: every merge to `main` already deploys the site.
- The settings are in `.github/release-please-config.json`, and the current
  versions in `.github/.release-please-manifest.json`. Never edit a version or
  a changelog by hand.
- The workflow signs in as a private GitHub App installed on this repository
  only, with read and write access to Contents, Issues and Pull requests. It
  mints a token that lasts an hour from the `RELEASE_APP_CLIENT_ID` and
  `RELEASE_APP_PRIVATE_KEY` secrets (`actions/create-github-app-token`).
  GitHub signs the App's commits, so the release PR's commit is Verified. A PR
  opened with the default `GITHUB_TOKEN` wouldn't start the required checks,
  so it could never merge.

## Content rules

These are deliberate; keep them unless I change them:

- Client names stay anonymized, as they are on the resume.
- The clearance level and the patent application number stay off the site.
- The operating-model redesign is listed as co-authored, with no claim that it
  was adopted.
- The stealth project stays "Stealth Startup", with no name or URL, until it
  launches.
- The public contact address is `hello@jimmykurian.me`, never a personal
  address. The public resume has no home address, phone or personal email.
- Posts are published here first, then syndicated with a canonical link back.
- No comment system for now.

## Design rules

- Editorial direction: Newsreader for display and the wordmark, Libre Franklin
  for text and UI.
- A ruled "ledger" layout: a heavy rule, a small-caps label column on the left,
  content on the right.
- No cards, pills, numbered sections or monospace eyebrows.
- Palette from Sanzo Wada's combination 207, with tokens at the top of
  `src/styles/global.css`: Black `#111314`, Sudan Brown `#a36752` (`#8f5a47`
  for small text), Glaucous Green `#b4cdc2`.
- No client-side framework. Small inline scripts only, and every one must
  respect `prefers-reduced-motion` where it animates.

## Questions

Email <hello@jimmykurian.me>.
