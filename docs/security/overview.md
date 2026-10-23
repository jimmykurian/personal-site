<!-- Copyright (c) 2026 Jimmy Kurian. All rights reserved. See LICENSE. Author: Jimmy Kurian. -->

# Security overview

How the site, its source and its supply chain are protected. To report a vulnerability, see [SECURITY.md](../../SECURITY.md).

## Threat model

The site is static: no server code, database, login, forms or cookies. It loads three cookieless observability tools ([observability](../observability.md)). What's left to protect:

| Asset | Threat | Main controls |
| --- | --- | --- |
| The live site | Script injected through build-time data (posts, JSON, the Goodreads feed), or from a compromised outside script | Astro escapes text by default, content is schema-validated, integration tests check every published file, and a Content-Security-Policy allows scripts only from the site and Cloudflare's beacon |
| Private data | A home address, phone number, personal email, clearance or patent application number reaching the site or the repo | `private/` is git-ignored, content rules are tested on every build |
| The deploy | A leaked deploy token, or unreviewed code reaching production | One narrowly used secret, PR-only `main`, required checks, pinned actions |
| The supply chain | A compromised or vulnerable npm package, action or tool | Lockfile rules, release-age delay, audits, OSV, dependency review, Dependabot |
| The repository | Secrets committed by mistake, history rewritten | Secret scanning with push protection, gitleaks, secretlint, signed commits, ruleset |

## The site

- **Static files only.** The build writes HTML, CSS, a few small inline scripts and images. Azure Static Web Apps serves them; nothing runs on the server.
- **HTTPS only.** Azure manages the certificates for `www` and the apex, and sends HSTS (`includeSubDomains; preload`). The apex and the `azurestaticapps.net` host redirect to <https://www.jimmykurian.me>.
- **Headers** from `website/public/staticwebapp.config.json`, on every response:

  | Header | Value |
  | --- | --- |
  | `X-Content-Type-Options` | `nosniff` |
  | `Referrer-Policy` | `strict-origin-when-cross-origin` |
  | `Permissions-Policy` | `camera=(), microphone=(), geolocation=()` |

  An integration test checks the config file ships with the build.
- **Content-Security-Policy.** Astro writes a `<meta http-equiv="content-security-policy">` on every page (`security.csp` in `website/astro.config.mjs`):
  - `script-src` allows only the site, with a hash for each of its own scripts, and Cloudflare's beacon (`https://static.cloudflareinsights.com`).
  - `connect-src` allows only the site, Cloudflare, Sentry (`*.ingest.us.sentry.io`) and PostHog (`us.i.posthog.com`).
  - `default-src`, `img-src`, `font-src`, `base-uri` and `form-action` stay on the site, and `object-src` is `'none'`.
  - `style-src` allows `'unsafe-inline'`, because Shiki writes inline styles in code blocks, which Astro can't hash.
  - An integration scenario checks the policy on every page, and the end-to-end suite fails on any CSP violation, since each one is a console error.
- **Third-party requests: the observability tools only.** Fonts and Goodreads covers are downloaded and optimized at build time. The only outside hosts are Cloudflare Web Analytics, Sentry and PostHog, all cookieless, with no session replay, profiles or personal data, and only on builds of `main` ([observability](../observability.md)). There are no embeds, ad trackers or cookies. An integration test fails if a page loads anything else from another host.
- **Build-time data is checked.** Every collection has a schema, so a bad field fails the build. Goodreads text is rendered as text, never as HTML.

## Private data

- The full original resume lives in git-ignored `private/` and is never published.
- The site and the public resume never show a home address, phone number or personal email; `hello@jimmykurian.me` is the only public address. Client names stay anonymized, and the clearance level and the patent application number stay off.
- Unit tests render the home page and resume from the real content, and integration tests scan every published file, failing on any of those patterns (`website/tests/support/rules.ts`).
- Everything committed is public, drafts included, so early drafts stay in `private/`.

## Secrets

| Secret | Used by | Access |
| --- | --- | --- |
| `AZURE_STATIC_WEB_APPS_API_TOKEN` | The Deploy and Close PR preview jobs | Uploads to, and removes previews from, the one Static Web App |
| `RELEASE_APP_CLIENT_ID`, `RELEASE_APP_PRIVATE_KEY` | The Release Please, Code metrics and Pull request assignee workflows | A private GitHub App installed on this repository only: Contents, Issues and Pull requests. The workflow mints a token from them that expires in an hour |

- Workflows default to `contents: read`, and each job asks only for the extra permission it needs. Checkouts don't keep credentials (`persist-credentials: false`).
- `.env` files are git-ignored; the build needs no keys.
- Secrets are never printed, in logs, docs or commits. Only Jimmy creates or rotates them.

## Repository controls

- **`main` is protected by a ruleset:** changes arrive only through squash-merged pull requests, with signed commits and a linear history, and `main` can't be force-pushed or deleted.
- **Required checks:** Title, Template, Repository, Website, Infrastructure and CodeQL. The code-scanning rule also blocks new high-severity CodeQL alerts.
- **Reviews:** Copilot reviews the pull requests Jimmy opens. `.github/CODEOWNERS` requests Jimmy's review on every other one (Renovate, Dependabot and the GitHub App). Code-owner review isn't required: a sole maintainer can't approve their own pull requests.
- **Signed commits:** every commit is SSH-signed and shows as Verified.
- **The git hooks** refuse commits and pushes on `main`, and scan staged files for secrets before each commit.

## Secret scanning

Four layers, from the commit to GitHub:

1. **The pre-commit hook** runs gitleaks and secretlint on the staged files.
2. **gitleaks in CI** scans the whole history, including registry URLs that aren't npm's (`.config/linters/gitleaks.toml`).
3. **secretlint in CI** checks the tracked files with its recommended rules, masking anything it finds (`.config/linters/secretlintrc.json`).
4. **GitHub secret scanning,** with push protection, blocks a push that contains a known token format.

## Supply chain

| Control | What it does |
| --- | --- |
| Pinned actions | Every action is pinned to a commit SHA, with the version as a comment. zizmor and actionlint check the workflows |
| Lockfile rules | `task lint:lockfile`: packages from registry.npmjs.org only, sha512 hashes, no git dependencies, an upper bound on every override, no npm or Yarn lockfile |
| Frozen installs | CI installs with `--frozen-lockfile`, at the pnpm version pinned in `package.json` |
| Release-age delay | Renovate waits 7 days before proposing a new version; Dependabot's security updates have a cooldown too |
| `pnpm audit` | Fails on a high or critical advisory |
| OSV-Scanner | Checks the lockfile against the OSV database at every severity |
| Dependency review | Fails a pull request that adds a dependency with any known advisory |
| Dependabot | Opens security updates as soon as an advisory lands |
| License check | Every installed package's license is on the allowed list |
| CodeQL | Scans the TypeScript and the workflows on every PR and on `main` |

Ignored advisories need a reason and a fix to wait for, and are listed in both `website/pnpm-workspace.yaml` and `.config/linters/osv-scanner.toml`. When an unused package carries an unpatched advisory, it's removed with a pnpm override instead of being ignored.

Tool versions are pinned in `.mise.toml`, so CI and every machine run the same linters and scanners.

## Hosting account

The site runs in a personal Azure subscription, never a work tenant. DNS is at Namecheap. Only Jimmy signs in to either, and the deploy token is the only credential CI holds.

## See also

- [SECURITY.md](../../SECURITY.md): reporting, scope and response times
- [CONTRIBUTING.md, Quality checks](../../CONTRIBUTING.md#quality-checks): every check and its config
- [Deployment overview](../deployment/overview.md)

Last reviewed: 2026-10-23
