<!-- Copyright (c) 2026 Jimmy Kurian. All rights reserved. See LICENSE. Author: Jimmy Kurian. -->

# Flows

How the site is built and deployed, how a change reaches production, the nightly rebuild, and what happens when someone visits. Back to the [architecture overview](README.md).

## Build and deploy

```mermaid
flowchart TD
    content["src/content/*.json, posts/*.mdx<br/>src/data/site.json<br/>(typed schemas)"]
    goodreads["Goodreads shelf RSS<br/>(fetched at build)"]
    fonts["Google Fonts<br/>(downloaded at build)"]
    unit["Unit tests on src/"]
    build["astro build<br/>(static output)"]
    dist["dist/: HTML, RSS, sitemap, optimized images,<br/>and resume.pdf (printed from /resume/ by headless Chrome)"]

    subgraph checks["Checks on the built site"]
        direction LR
        integration["Integration tests<br/>on dist/"] --> e2e["e2e + axe<br/>in Chrome"] --> lighthouse["Lighthouse"]
    end

    swa["Azure Static Web Apps (Free)<br/>production on main, a preview per PR"]
    www["www.jimmykurian.me<br/>(DNS at Namecheap; www is the canonical host)"]

    content & goodreads & fonts --> build --> dist --> checks
    unit --> deploy{"Every check passed?"}
    checks --> deploy
    deploy -- yes --> swa --> www
    deploy -- no --> stop["No deploy; the last one stays live"]
```

## A change, from branch to production

```mermaid
sequenceDiagram
    autonumber
    actor Jimmy
    participant GH as GitHub
    participant CI as GitHub Actions (CI)
    participant SWA as Azure Static Web Apps
    participant RP as Release Please

    Jimmy->>GH: Push a branch and open a PR (template, Conventional Commits title)
    GH->>CI: pull_request
    par Checks
        CI->>CI: Repository, Website, Infrastructure jobs (only the parts that changed)
    and Reviews
        GH->>GH: CodeQL, Copilot review, Title and Template checks
    end
    CI->>GH: Comment the check table (whatever the results)
    alt website/ changed and every check passed
        CI->>SWA: Upload dist/ to a preview environment
        CI->>GH: Comment the preview URL
    else No website build, or a check failed
        Note over CI,SWA: No preview
    end
    Jimmy->>GH: Enable auto-merge
    GH->>GH: Squash-merge once the required checks pass
    GH->>CI: push to main
    CI->>CI: Every check on main (the Website job always runs here)
    CI->>GH: Update the README badges (badges branch), pass or fail
    alt Every check passed
        CI->>SWA: Upload dist/ to production
    else A check failed
        CI--xSWA: No deploy, and the last one stays live
    end
    GH->>RP: push to main
    RP->>GH: Open or update the release PR (versions and CHANGELOG.md)
    opt The code changed
        GH->>CI: push to main (code-metrics.yml)
        CI->>GH: Open or update the code metrics PR, if a number changed
    end
    CI->>SWA: Remove the preview when the PR closes
```

## Nightly rebuild

```mermaid
sequenceDiagram
    autonumber
    participant Cron as Schedule (11:00 UTC)
    participant CI as GitHub Actions (CI)
    participant GR as Goodreads RSS
    participant SWA as Azure Static Web Apps
    participant Web as External sites

    Cron->>CI: schedule
    CI->>GR: Fetch each shelf's feed pages (goodreadsLoader)
    alt 5xx, rate limit or network error
        CI->>GR: Retry, up to twice per page
    end
    alt A shelf still can't be read
        CI->>CI: Use the books saved in src/content/books.json, with a warning
    else Every shelf read
        CI->>CI: Save the books to src/content/books.json
    end
    CI->>CI: Build, test, print resume.pdf
    CI->>SWA: Upload dist/ to production
    CI->>Web: Check the external links (lychee)
```

## A visitor's request

```mermaid
sequenceDiagram
    autonumber
    actor Visitor
    participant DNS as Namecheap DNS
    participant SWA as Azure Static Web Apps

    Visitor->>DNS: Look up www.jimmykurian.me
    DNS-->>Visitor: CNAME to the Static Web App's host
    Visitor->>SWA: GET /writing/
    SWA-->>Visitor: Prebuilt HTML, with the security headers from staticwebapp.config.json
    Visitor->>SWA: GET /_astro/*.css, images, fonts
    SWA-->>Visitor: Fingerprinted files, cached for a year
    opt The apex, jimmykurian.me
        SWA-->>Visitor: Redirect to www, the default domain
    end
    opt A missing page
        SWA-->>Visitor: 404 with /404.html
    end
```

## See also

- [Architecture index](README.md)
- [Deployment overview](../deployment/overview.md)
- [Testing strategy](../testing/testing-strategy.md)

Last reviewed: 2026-10-23
