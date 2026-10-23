<!-- Copyright (c) 2026 Jimmy Kurian. All rights reserved. See LICENSE. Author: Jimmy Kurian. -->

# Accessibility

The site's accessibility goal, how it's checked today, the gaps that remain, and the rules that keep it there.

## The goal

**[WCAG 2.2](https://www.w3.org/TR/WCAG22/) Level AA on every page, plus the Level AAA criteria listed below.**

Full AAA isn't the goal. The W3C [doesn't recommend](https://www.w3.org/WAI/WCAG22/Understanding/conformance#levels) it as a policy for whole sites, because some AAA criteria can't be met for all content. Here, the AAA contrast ratio (7:1) would rule out the palette's accent for text, and AAA reading level doesn't fit a resume.

The site is static HTML and CSS with a few small scripts. It has no forms, video, audio or third-party widgets, so AA is a realistic target. Most of the work is keeping it as the content grows.

## Where it stands

| Area | Status |
| --- | --- |
| WCAG 2.1 A and AA, automated | Passing: axe runs on every route at desktop and phone sizes, and fails the build on any violation |
| WCAG 2.2 additions, automated | Not checked yet: the axe test doesn't include the `wcag22aa` tag (target size, 2.5.8) |
| Pause, Stop, Hide (2.2.2, Level A) | **Not met:** the home page headline loops and its caret blinks with no control (see [Known gaps](#known-gaps)) |
| Lighthouse accessibility | Passing: CI fails below 0.95 on `/`, `/writing/`, a post and `/reading/` |
| Manual checks (screen reader, zoom, text spacing) | Done ad hoc, not recorded |

## How it's checked

- **axe** (`website/tests/e2e/a11y.spec.ts`): WCAG 2.0 and 2.1 A and AA rules on every route, in Chrome at 1280×800 and as a Pixel 7. Any violation fails CI.
- **End-to-end tests** (`website/tests/e2e/`): the skip link, the keyboard path through the navigation and the phone menu, the headline staying still with reduced motion, and the reading list working without JavaScript.
- **Lighthouse** (`.config/lighthouserc.json`): the accessibility score must be at least 0.95.
- **ESLint** (`website/eslint.config.js`): `eslint-plugin-astro`'s `jsx-a11y-recommended` rules on the markup in every `.astro` file, for things like missing alt text and misused ARIA attributes.

Automated tools find only part of what WCAG covers. Focus order, meaningful alt text, motion and reading order still need a person to check.

## Level AAA criteria in scope

| Criterion | Target | Today |
| --- | --- | --- |
| [1.4.6 Contrast (Enhanced)](https://www.w3.org/WAI/WCAG22/Understanding/contrast-enhanced) | Body text and UI at least 7:1 | Met for `--ink` (18.6:1). The accent text, `--accent-small` (5.6:1), stays at AA by choice |
| [2.3.3 Animation from Interactions](https://www.w3.org/WAI/WCAG22/Understanding/animation-from-interactions) | Every animation stops with `prefers-reduced-motion` | Met: the headline, the caret and the cover lift all respect it |
| [2.4.13 Focus Appearance](https://www.w3.org/WAI/WCAG22/Understanding/focus-appearance) | A visible, solid focus indicator with 3:1 contrast | Met: `:focus-visible` draws a 2px `--accent` outline (4.6:1 on white) with a 3px offset |
| [2.5.5 Target Size (Enhanced)](https://www.w3.org/WAI/WCAG22/Understanding/target-size-enhanced) | Controls at least 44×44px | Met for the navigation, the phone menu and the hero icons. Links inside sentences are exempt |

## Color contrast

The palette tokens are in `website/src/styles/global.css`. The ratios are on white (`--paper`):

| Token | Ratio | Use and level |
| --- | --- | --- |
| `--ink` `#111314` | 18.6:1 | All body text: AAA |
| `--accent-small` `#8f5a47` | 5.6:1 | Accent text under about 18px: AA |
| `--accent` `#a36752` | 4.6:1 | Display text 18px and up, focus outlines and hover underlines: AA |
| `--mist` `#b4cdc2` | 1.7:1 | Decorative only: hairlines, cover borders, the credentials band, and the empty stars in a rating, where the filled `--accent` stars and the label ("Rated 4 of 5") carry the value. Never text or a control's only boundary. `--ink` on `--mist` is 11.1:1 |

## Known gaps

1. **The home page headline (2.2.2 Pause, Stop, Hide, Level A).** The emphasis phrase types and erases in an endless loop, and the caret blinks forever (`website/src/pages/index.astro`). Visitors who set reduced motion see a still headline, but nobody else can stop it. The fix: run through the phrases once, then stop on the first phrase with the caret hidden, so the motion ends within a few seconds. The alternative is a visible pause button. Either change needs an end-to-end test.
2. **WCAG 2.2 in axe.** Add `wcag22aa` to the tags in `a11y.spec.ts` so target size (2.5.8) is checked too.
3. **No record of manual checks.** Run the checklist below at least once per release, and note the date and any findings in the release PR.

## Rules for changes

These apply to every change to `website/`, on top of [the design guidelines](design/design-guidelines.md):

- **Color:** use the palette tokens, never a literal color. Accent text under about 18px uses `--accent-small`. Never convey meaning by color alone.
- **Structure:** one `h1` per page, headings in order, and landmarks (`header`, `nav`, `main`, `footer`). Each `section` is labelled by its heading (`aria-labelledby`).
- **Images:** every image has alt text that says what it shows. A purely decorative image has `alt=""`. An icon-only link has an `aria-label`.
- **Keyboard:** everything works with a keyboard alone, in a logical order. Don't remove the `:focus-visible` outline.
- **Motion:** anything that moves respects `prefers-reduced-motion`. Anything that starts on its own stops within 5 seconds or has a pause control.
- **Targets:** buttons and standalone links are at least 44×44px.
- **Language:** the page sets `lang="en"`. A passage in another language sets its own `lang`.
- **Tests:** a new page goes into the routes in `website/tests/e2e/fixtures.ts`, so axe and the other end-to-end checks cover it.

## Manual checklist

Run it on the PR preview or with `task build && pnpm --dir website preview`:

1. **Keyboard:** tab through every page. The skip link comes first, the focus is always visible and never gets stuck, and the phone menu opens and closes from its toggle with Enter or Space.
2. **Screen reader:** VoiceOver on macOS (Safari) and iOS. Each page's headings and landmarks read in order, link names make sense out of context, and the headline reads as one sentence.
3. **Zoom and reflow:** at 200% and 400% zoom, and at a 320px-wide viewport, nothing is cut off or needs horizontal scrolling (1.4.4, 1.4.10).
4. **Text spacing:** with line height 1.5, paragraph spacing 2em, letter spacing 0.12em and word spacing 0.16em, no text overlaps or is clipped (1.4.12).
5. **Reduced motion:** with reduced motion turned on in the operating system, nothing on the site moves.

## Reporting a problem

Email [hello@jimmykurian.me](mailto:hello@jimmykurian.me) with the page and what got in the way. Accessibility problems are fixed as bugs, ahead of new features.

## See also

- [Design guidelines](design/design-guidelines.md)
- [Testing strategy](testing/testing-strategy.md)
- [CONTRIBUTING.md, Design rules](../CONTRIBUTING.md#design-rules)

Last reviewed: 2026-10-23
