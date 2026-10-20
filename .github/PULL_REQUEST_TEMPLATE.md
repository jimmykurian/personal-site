# Description

Summarize the change and why it's needed. Link the related issue.

Fixes # (issue)

## Type of change

Delete the options that don't apply.

- [ ] Bug fix (non-breaking change which fixes an issue)
- [ ] New feature or page (non-breaking change which adds functionality)
- [ ] New or updated post or content
- [ ] Breaking change (removes or moves a URL, feed or file people may link to)
- [ ] Build, CI or hosting change
- [ ] Documentation only

## How Has This Been Tested?

- [ ] `task lint`, `task test`, `task test:integration` and `task test:e2e`
      pass
- [ ] Added or updated the matching unit tests in `tests/unit/`, and any snapshot
      changes are intended
- [ ] Checked in `pnpm preview` at desktop and phone widths, with no
      horizontal scroll
- [ ] Checked in light and dark mode
- [ ] Checked on the PR preview environment
- [ ] `pnpm resume` still produces a correct `resume.pdf` (if the resume or
      its data changed)

## Checklist

- [ ] The PR title follows Conventional Commits, with a scope where one fits
- [ ] Commits are signed (Verified)
- [ ] Follows the design rules (ledger layout; no cards, pills, numbered
      sections or monospace eyebrows; palette 207)
- [ ] Keeps the content rules: anonymized clients; no clearance, patent number,
      home address, phone or personal email; `hello@jimmykurian.me` as the only
      contact address
- [ ] Nothing from `private/`, no `.env` file and no secret is included
- [ ] `pnpm-lock.yaml` changes only with a deliberate dependency change
- [ ] `AGENTS.md` and `README.md` are updated if a decision or a command changed
- [ ] New posts have a description and a `pubDate`, and `draft` is off when
      they're ready

## Change in Action

Add a screenshot or GIF of the change, or mark as N/A.
