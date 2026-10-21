<!-- Copyright (c) 2026 Jimmy Kurian. All rights reserved. See LICENSE. Author: Jimmy Kurian. -->

# Documentation style guide

How to write and maintain the docs in `docs/`, the READMEs and CONTRIBUTING.md.

## Tone and voice

- **Lead with the answer.** Say what something does or what to do first, then why.
- **Everyday words.** Name things by what they are, and explain a term the first time it appears.
- **Active voice.** "CI uploads `dist/`", not "`dist/` is uploaded by CI".
- **Imperative for steps.** "Run `task build`", not "You should run `task build`".
- **Facts, checked against the code.** A doc that describes a check, a job or a file says what it actually does today. Don't describe plans as if they shipped.

## Document structure

Every document in `docs/` follows this shape:

```markdown
<!-- Copyright (c) 2026 Jimmy Kurian. All rights reserved. See LICENSE. Author: Jimmy Kurian. -->

# Title

One line on what this document covers.

## Section

Content.

## See also

- [Related document](../path/to/doc.md)

Last reviewed: YYYY-MM-DD
```

### Required elements

1. **The copyright and author comment** on the first line. `task lint:headers` fails without it.
2. **One H1**, matching the topic, then a one-line description.
3. **"See also"** when the document points to other docs.
4. **"Last reviewed"** as the last line, updated whenever the document changes.

Headings are sentence case. File names are lowercase with hyphens (`testing-strategy.md`), apart from `README.md` and this file.

## Formatting

### Diagrams

Use [Mermaid](https://mermaid.js.org/), which GitHub renders in place. No images of diagrams and no ASCII art.

- Pick the kind that fits: `flowchart` for a pipeline or data flow, `sequenceDiagram` for an exchange over time, `classDiagram` for a data model, and `C4Context` or `C4Container` for the system's structure.
- Quote any label with punctuation. Don't put a `;` in a sequence message: Mermaid reads it as the end of the statement and the diagram fails to render.
- Check a new or changed diagram on GitHub before merging. A diagram that fails shows "Unable to render rich display" instead.

### Code blocks

Give every fence a language: `sh` for commands, `ts`, `json`, `yaml`, `hcl`, `text` for trees and plain output, and `mermaid` for diagrams.

### Links

- **Within the repository:** relative paths, such as `../../CONTRIBUTING.md#releases`. They work on GitHub and in an editor.
- **Outside the repository:** full URLs.
- Link to the section that answers the question, not just the file.

### Tables

Use tables for reference data: a check and its config, a trigger and its result. Keep each row to a line or two; longer explanations go in a list below the table.

## Content

### No duplication

The docs here explain how the parts fit together and link to the detail. Each fact has one home:

| Topic | Home |
| --- | --- |
| Every check, its config and the git hooks | [CONTRIBUTING.md, Quality checks](../CONTRIBUTING.md#quality-checks) |
| Writing tests | [CONTRIBUTING.md, Tests](../CONTRIBUTING.md#tests) and [website/README.md, Tests](../website/README.md#tests) |
| Deploy triggers and releases | [CONTRIBUTING.md, Deploys](../CONTRIBUTING.md#deploys) and [Releases](../CONTRIBUTING.md#releases) |
| Reporting a vulnerability | [SECURITY.md](../SECURITY.md) |
| The Azure resources and DNS | [infrastructure/README.md](../infrastructure/README.md) |

When a doc here needs one of these, summarize it in a sentence and link to it.

### Length

Aim for 100 to 300 lines. Split a document that grows past that.

### Privacy and security

Everything committed is public, and the content rules in [AGENTS.md](../AGENTS.md#content-rules-everything-published) apply to the docs too:

- No secret, token or key, not even a revoked one. Name a secret by its Actions secret name only.
- No home address, phone number or personal email. The only public contact address is `hello@jimmykurian.me`.
- Client names stay anonymized, as they are on the resume.
- Use placeholders in examples: `<TOKEN>`, `<RESOURCE_GROUP>`.

## Maintenance

- Update the docs in the same pull request as the change they describe.
- Update "Last reviewed" on every document you change.
- Run `task lint:markdown`, `task lint:spelling` and `task lint:inclusive-language` before you push. Add a new word to `.config/spelling/words.txt`.

## See also

- [Documentation index](README.md)

Last reviewed: 2026-10-20
