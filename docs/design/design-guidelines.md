<!-- Copyright (c) 2026 Jimmy Kurian. All rights reserved. See LICENSE. Author: Jimmy Kurian. -->

# Design guidelines

The site's visual system: an editorial direction, one palette, two typefaces and a ruled ledger layout, with no client framework.

## Direction

The site reads like a printed annual report or a well-set resume, not an app:

- **Editorial, not product UI.** Newsreader for display and the wordmark, Libre Franklin for text and UI.
- **A ruled ledger.** Each section is a heavy rule, a small-caps label column on the left and the content on the right.
- **Nothing decorative.** No cards, pills, numbered sections, monospace eyebrows or gradients. The one shadow is the hard ink offset under the reading-list covers.
- **Static and quiet.** No client-side framework. Small inline scripts only, and every one that animates respects `prefers-reduced-motion`.

These rules are also in [CONTRIBUTING.md, Design rules](../../CONTRIBUTING.md#design-rules) and [website/AGENTS.md](../../website/AGENTS.md); this page explains how they're applied.

## Color

The palette is Sanzo Wada's combination 207, from *A Dictionary of Color Combinations*. The tokens sit at the top of `website/src/styles/global.css`; use them, never a literal color.

| Token | Value | Name | Use |
| --- | --- | --- | --- |
| `--ink` | `#111314` | Black | Type, rules, buttons |
| `--accent` | `#a36752` | Sudan Brown | Display accents, hover underlines |
| `--accent-small` | `#8f5a47` | Sudan Brown, darkened | Accent text under about 18px, to keep its contrast at WCAG AA |
| `--mist` | `#b4cdc2` | Glaucous Green | Hairlines, the credentials band, the portrait frame |
| `--paper` | `#fff` | White | The page |

There's one light theme. Contrast is checked by axe on every page in the end-to-end tests, and Lighthouse fails the build below 0.95 for accessibility.

## Typography

| Family | Token | Weights | Use |
| --- | --- | --- | --- |
| Newsreader | `--serif` (`--font-serif`) | 400 to 600 | Section titles, entry and list titles, the wordmark, display text |
| Libre Franklin | `--sans` (`--font-sans`) | 400 to 600 | Body text, labels, navigation, metadata |

- Both come from Google Fonts through Astro's font API, downloaded at build time and served from the site. The live site makes no font requests to Google.
- Display sizes scale with `clamp()`: section titles from 30 to 44px, entry titles from 22 to 27px, list titles from 21 to 23px.
- Body text is 16px. Metadata is 13px, and labels are 11 to 12px small caps with `--tracking-caps` (0.14em) letter spacing.

## Layout

| Token | Value | Use |
| --- | --- | --- |
| `--measure` | 1160px | The widest the content gets |
| `--gutter` | `clamp(16px, 5vw, 72px)` | The page's side padding |
| `--label-col` | 200px | The ledger's label column |
| `--col-gap` | 56px | The gap between label and content |
| `--section-space` | `clamp(56px, 7vw, 96px)` | Space between ledger sections |

- **`Ledger.astro`** draws one ruled section. Build pages from ledgers rather than new section styles.
- **Breakpoints:** the main one is 860px, where the ledger's label column stacks above its content and the header switches to the phone menu. A few components adjust again at 720px, 640px and 480px.
- **No horizontal scroll** at any width. The end-to-end tests check every page at a desktop size (1280×800) and a phone (Pixel 7).

## Components

| Component | Purpose |
| --- | --- |
| `Header.astro` | The wordmark and navigation, with a menu on phones that closes after a link is followed |
| `Footer.astro` | Contact links and the link to the source repository |
| `Ledger.astro` | One ruled section: a small-caps label column and the content |
| `PostList.astro` | The writing archive, grouped by year, then by month |
| `WritingHero.astro` | The heading block at the top of the writing pages |
| `BookRows.astro` | The reading list's rows: a group label, title and author, and the rating |
| `Icon.astro` | Solid brand marks from Simple Icons, plus an envelope drawn to match |

Every component has a unit test at the same path under `website/tests/unit/`.

## Motion

There are three animations, all small:

- The home page headline types through its phrases behind a blinking caret, held at the height of its longest phrase so the page doesn't jump.
- The social icons in the home page hero fade their color on hover (0.15s).
- Reading-list covers lift 4px on hover (0.2s).

Nothing moves on scroll. With `prefers-reduced-motion: reduce`, the headline shows its first phrase without the caret, and the covers don't move. Anything new that animates follows the same rule.

## Images

- Images go through Astro's `<Image>`, which writes optimized, fingerprinted files to `/_astro/` with explicit sizes, so nothing shifts as they load. Lighthouse fails above 0.1 layout shift.
- Goodreads covers are downloaded and optimized at build time.
- Every image has alt text. Decorative ones use an empty `alt`.
- Logos and insignia live in `website/src/assets/`, named as the content's `logo` field refers to them.

## The resume

`/resume/` is the print source for `/resume.pdf`, rendered from the same content as the site. Its print styles drop the page padding and the width limit, and links print without underlines. It's `noindex` and left out of Lighthouse.

## See also

- [Accessibility](../accessibility.md)
- [Architecture: content model](../architecture/content-model.md)
- [Testing strategy](../testing/testing-strategy.md)

Last reviewed: 2026-10-23
