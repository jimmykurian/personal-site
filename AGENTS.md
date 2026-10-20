# jimmykurian.me

Jimmy Kurian's personal site: a portfolio, resume and blog at <https://www.jimmykurian.me>. The repository is public but proprietary, and Jimmy is its only contributor. This file holds what applies to every task; follow it unless told otherwise.

## Map

- `website/`: the Astro site (static output, TypeScript, MDX, no client framework). Read [website/AGENTS.md](website/AGENTS.md) before working there.
- `infrastructure/`: OpenTofu modules and tests for the Azure resources. Nothing there deploys yet. Read [infrastructure/AGENTS.md](infrastructure/AGENTS.md) before working there.
- Root tooling: `.mise.toml` pins every tool version (Node included; pnpm stays pinned by `packageManager` in `website/package.json`). `Taskfile.yml` holds every command, and CI and the git hooks call those tasks. `.config/` holds the repo-wide configs, grouped into `formatters/`, `linters/`, `spelling/` and `licenses/`, and `.githooks/` holds plain bash hooks.
- Keep the root to the files already there. New project files go in `website/` or `infrastructure/`. The one root linter config is `.alexrc.yml`: alex only reads its config from the linted files' folders and their parents. Claude Code reads AGENTS.md files directly; there's no `CLAUDE.md`.

## Working here

- Set up with `mise install`, `task install` and `task hooks:install`. Run `task` to list every command.
- Before you call a change done, run `task lint` and `task test`. Also run `task build`, `task test:integration` and `task test:e2e` when the change affects published output.
- Every check fails the build. Never add `|| true`, `continue-on-error` or warn-only checks. Fix the finding, or skip it inline with a stated reason.
- `main` takes changes only through squash-merged pull requests. Branch first, and fill in `.github/PULL_REQUEST_TEMPLATE.md`, keeping every heading and replacing its instructions. The PR title becomes the commit on `main`, so it follows Conventional Commits. CI checks both (`task lint:pr-template`, `task lint:pr-title`).
- Commits follow Conventional Commits, with the scopes listed in `.gitmessage`. They're SSH-signed; never pass `--no-gpg-sign`. A new scope goes in both `.gitmessage` and `.config/commitlintrc.json`, and a new cspell word in `.config/spelling/words.txt`.
- Install npm packages only from registry.npmjs.org. On a network that can't reach it, resolve lockfile changes in CI. Never point the lockfile at another registry; `task lint:lockfile` blocks that.
- Never print secrets or tokens. Jimmy does the logins.

## Hosting

- Azure Static Web Apps (Free plan), app `jimmykurian-me` in resource group `rg-personal-site`, in Jimmy's personal Azure subscription ("Azure subscription 1", personal directory), default host `yellow-flower-092ce0d0f.3.azurestaticapps.net`. Never use another tenant.
- GitHub Actions builds the site and uploads `website/dist`. Each PR gets a preview environment. The workflow also rebuilds nightly and then checks external links.
- DNS stays at Namecheap. `www` is the canonical host.

## More detail

- `README.md`: the architecture, the principles, the checks table and the repo structure.
- `CONTRIBUTING.md`: setup, the workflow, signed commits, tests, deploys, and the content and design rules.
- `website/README.md`: where each piece of content lives, posts, the resume, the reading list and the test suites.
- `infrastructure/README.md`: the modules, their tests and checks, and how the live resources were created.

## Content rules (everything published)

- Client names stay anonymized, as they are on the resume.
- Leave the clearance level and the patent application number off the site.
- The operating-model redesign is listed as co-authored, with no claim that it was adopted.
- The public resume and the site never show a home address, phone number or personal email. The full original resume lives in git-ignored `private/` and is never published.
- The only public contact address is `hello@jimmykurian.me`.
- Everything committed is public, drafts included, so early drafts stay in `private/`.
