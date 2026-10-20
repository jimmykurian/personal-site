# Security Policy

## About this project

This repository is the source of [jimmykurian.me](https://www.jimmykurian.me),
a personal site. It is a fully static Astro build hosted on Azure Static Web
Apps: there is no backend, no database, no login, no forms and no cookies. The
attack surface is small, but reports are still welcome.

## Supported versions

Only the live site and the `main` branch are supported. There are no releases
or older versions to patch; a fix ships with the next deploy.

## Reporting a vulnerability

**Please don't report security issues through public channels.** Email
<hello@jimmykurian.me> with the details. The repository is private, so GitHub
issues and private vulnerability reporting aren't available.

Please include:

- The affected URL or file
- Steps to reproduce
- What an attacker could do with it

### What to expect

This is a one-person project, so these are goals rather than guarantees:

| Action                 | Timeframe                         |
| ---------------------- | --------------------------------- |
| Acknowledgment         | Within 5 days                     |
| Assessment and update  | Within 14 days                    |
| Fix                    | As soon as practical for severity |

There is no bug bounty. I'm happy to credit you once it's fixed, unless you'd
rather stay anonymous.

### In scope

- Content served from `www.jimmykurian.me` or `jimmykurian.me`
- Injection through build-time data (blog posts, the Goodreads feed, JSON
  content) that ends up as script on the site
- Leaks of anything that should stay private (see below)
- Weaknesses in the GitHub Actions workflow, such as a way to expose the deploy
  token or deploy unreviewed code

### Out of scope

- Azure, GitHub, Namecheap and Goodreads themselves: report to those vendors
- Missing best-practice headers or DNS records with no demonstrated impact
- Denial of service, load testing and automated scanning at volume
- Social engineering

## How the site is secured

### Hosting and transport

- **Static output only:** the build produces HTML, CSS, a little inline
  JavaScript and images. Nothing runs on the server.
- **HTTPS everywhere:** Azure-managed certificates for `www` and the apex, HSTS
  (`includeSubDomains; preload`), and the apex and `*.azurestaticapps.net`
  hosts redirect to `https://www.jimmykurian.me`.
- **Headers** in `website/public/staticwebapp.config.json`:
  `X-Content-Type-Options: nosniff`, `Referrer-Policy:
  strict-origin-when-cross-origin`, and a `Permissions-Policy` that turns off
  the camera, microphone and geolocation.
- **No third-party requests:** fonts are downloaded at build time and served
  from the site, Goodreads covers are optimized into `/_astro/`, and there are
  no analytics or embeds.

### Secrets and private data

- **One secret:** the Static Web Apps deploy token, stored only as the
  `AZURE_STATIC_WEB_APPS_API_TOKEN` Actions secret. The workflow runs with
  `contents: read` and `pull-requests: write`, nothing more.
- **Private data stays out of the repo:** the full resume original lives in
  `website/private/`, which is git-ignored. The public resume has no home
  address, phone, personal email, clearance or patent application number, and
  the only public contact address is `hello@jimmykurian.me`.
- **`.env` files** are git-ignored. The build needs no keys today.
- **Personal hosting:** the site runs in a personal Azure subscription.

### Source integrity

- **Signed commits:** commits are SSH-signed and show as Verified on GitHub.
- **Locked dependencies:** CI installs with `pnpm install --frozen-lockfile`
  from the committed `pnpm-lock.yaml`, with the pnpm version pinned in
  `package.json`.

## Responsible disclosure

Please give me reasonable time to fix an issue before disclosing it, and don't
access or change data that isn't yours. I won't pursue action against anyone
reporting in good faith.

## Attribution

Structure adapted from the [OpenSSF Vulnerability Disclosure
Guide][ossf-guide], licensed under [CC-BY-4.0][cc-by].

[ossf-guide]: https://github.com/ossf/oss-vulnerability-guide
[cc-by]: https://creativecommons.org/licenses/by/4.0/

---

Last updated: October 2026
