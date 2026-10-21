<!-- Copyright (c) 2026 Jimmy Kurian. All rights reserved. See LICENSE. Author: Jimmy Kurian. -->

# Content model

A UML class diagram of the content. Back to the [architecture overview](README.md).

## Collections, helpers and pages

The content collections in `website/src/content.config.ts`, the helpers in `website/src/lib/` and the pages that read them.

```mermaid
classDiagram
    direction LR

    class posts {
        <<collection: src/content/posts/*.mdx>>
        +string title
        +string description
        +Date pubDate
        +Date updatedDate?
        +string[] tags
        +boolean draft
        +URL canonical?
    }
    class experience {
        <<collection: experience.json>>
        +civilian|military group
        +string org
        +string role
        +int start
        +int end?
        +string[] stack
        +boolean training
        +ResumeRole resume?
    }
    class projects {
        <<collection: projects.json>>
        +string kicker
        +string title
        +string summary
        +Link link?
        +string[] tags
        +boolean hidden
    }
    class writing {
        <<collection: writing.json>>
        +article|chapter|patent|talk kind
        +string title
        +string venue
        +int year?
        +URL href?
        +boolean featured
    }
    class teaching {
        <<collection: teaching.json>>
        +teaching|speaking|community|volunteering group
        +string title
        +string detail
        +string years?
        +ResumeRole resume?
    }
    class books {
        <<collection: Goodreads RSS>>
        +string shelf
        +int position
        +string title
        +string author
        +int rating
        +Date readAt?
        +URL cover?
        +URL href
    }

    class goodreadsLoader {
        <<loader: lib/goodreads.ts>>
        +goodreadsLoader(userId, shelves) Loader
    }
    class postsLib {
        <<lib/posts.ts>>
        +getPosts() Post[]
        +readingMinutes(body) number
        +formatDate(date) string
    }
    class writingLib {
        <<lib/writing.ts>>
        +getWriting() WritingItem[]
        +featuredLabel(item) string
        +listLabel(item) string
    }
    class contentLib {
        <<lib/content.ts>>
        +getOrdered(collection) Entry[]
    }

    goodreadsLoader ..> books : loads
    postsLib ..> posts : reads, drops drafts
    writingLib ..> writing : reads
    contentLib ..> experience : orders
    contentLib ..> projects : orders
    contentLib ..> teaching : orders

    class HomePage["/ and /resume/"]
    class WritingPages["/writing/, /writing/[id]/, rss.xml"]
    class ReadingPage["/reading/"]
    HomePage --> contentLib
    HomePage --> writingLib
    WritingPages --> postsLib
    WritingPages --> writingLib
    ReadingPage --> books
```

## See also

- [Architecture index](README.md)
- [Design guidelines](../design/design-guidelines.md)
- [TypeDoc API docs](../../website/docs/README.md)

Last reviewed: 2026-10-20
