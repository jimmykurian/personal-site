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
- [Before you push](#before-you-push)
- [Tests](#tests)
- [Deploys](#deploys)
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
pnpm test:integration  # build the site, then check the output
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
  template (`task lint:pr-template`), and labels the PR by the paths it
  changes (`.github/labeler.yml`).
- Merging needs the CI checks, CodeQL and a Copilot review to pass. `main`
  keeps a linear history of signed commits, and can't be force-pushed or
  deleted.
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

`tests/integration/` tests the built site instead. `setup.ts` runs a production build into
a temporary folder (or uses the `dist/` named by `INTEGRATION_DIST`), and each test reads
the output through `tests/support/dist.ts`. They need the network, since the build reads
Goodreads and downloads the fonts. When a change affects what gets published (a new page,
file, header or rule), add a check there.

`tests/e2e/` holds the Playwright specs. They import `test` and `expect` from
`tests/e2e/fixtures.ts`, which fails a test on console errors, uncaught exceptions and
failed requests. Write them as Arrange, Act, Assert too, and prefer role-based locators
(`getByRole`). Use `test.skip` with `isPhone(page)` for checks that only apply at one size.
Anything that needs a real browser belongs here: scripts, focus, scrolling, layout.

## Deploys

`.github/workflows/azure-static-web-apps.yml` runs `task lint`'s checks, then the
unit tests with coverage, builds `website/` and prints the resume PDF, runs the
integration, end-to-end and Lighthouse checks on the build, and uploads
`website/dist/` to Azure Static Web Apps:

| Trigger            | Result                                         |
| ------------------ | ---------------------------------------------- |
| Push to `main`     | Production deploy                              |
| Pull request       | Preview environment, closed when the PR closes |
| Nightly, 11:00 UTC | Rebuild so `/reading/` picks up Goodreads, then check external links |
| Manual dispatch    | Rebuild on demand                              |

If Goodreads can't be reached, the build fails and the last deploy stays live.
Re-run the workflow once it's back.

`infrastructure/` holds OpenTofu modules for the Azure resources, with their
tests; they aren't deployed from there yet. `.github/workflows/infrastructure.yml`
runs `task infra:check` and `task infra:test` when it changes; run them before
you push.

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
