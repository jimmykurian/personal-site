import { defineCollection } from 'astro:content';
import { file, glob } from 'astro/loaders';
import { z } from 'astro/zod';
import site from './data/site.json';
import { goodreadsLoader } from './lib/goodreads';

const posts = defineCollection({
  loader: glob({ pattern: '**/*.mdx', base: './src/content/posts' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    pubDate: z.coerce.date(),
    updatedDate: z.coerce.date().optional(),
    tags: z.array(z.string()).default([]),
    draft: z.boolean().default(false),
    // Set only when the piece was published somewhere else first.
    canonical: z.url().optional(),
  }),
});

const experience = defineCollection({
  loader: file('src/content/experience.json'),
  schema: z.object({
    // Military roles render in their own subsection; for them `org` is the unit.
    group: z.enum(['civilian', 'military']).default('civilian'),
    org: z.string(),
    // File name (no extension) in src/assets/logos/ or src/assets/insignia/, shown under the dates.
    logo: z.string().optional(),
    role: z.string(),
    start: z.number().int(),
    end: z.number().int().nullable(),
    team: z.string().optional(),
    summary: z.string().optional(),
    stack: z.array(z.string()).default([]),
    // Schools and initial training: listed on the site, left off the resume.
    training: z.boolean().default(false),
    // Resume only (src/pages/resume.astro). `org` and `title` override the site's wording.
    resume: z
      .object({
        org: z.string().optional(),
        title: z.string().optional(),
        location: z.string(),
        dates: z.string(),
        highlights: z.array(z.string()).default([]),
      })
      .optional(),
  }),
});

const projects = defineCollection({
  loader: file('src/content/projects.json'),
  schema: z.object({
    // File name (no extension) in src/assets/logos/.
    logo: z.string().optional(),
    kicker: z.string(),
    title: z.string(),
    summary: z.string(),
    link: z.object({ href: z.url(), label: z.string() }).optional(),
    tags: z.array(z.string()).default([]),
    // Kept in the file but left off the site.
    hidden: z.boolean().default(false),
  }),
});

const writing = defineCollection({
  loader: file('src/content/writing.json'),
  schema: z.object({
    kind: z.enum(['article', 'chapter', 'patent', 'talk']),
    title: z.string(),
    venue: z.string(),
    year: z.number().int().optional(),
    // Talks: "Talk", "Panel", "Roundtable". Patents: "Filed", "Granted".
    format: z.string().optional(),
    href: z.url().optional(),
    featured: z.boolean().default(false),
    // Extra line shown only on the home page.
    featuredNote: z.string().optional(),
  }),
});

const teaching = defineCollection({
  loader: file('src/content/teaching.json'),
  schema: z.object({
    group: z.enum(['teaching', 'speaking', 'community', 'volunteering']),
    title: z.string(),
    detail: z.string(),
    years: z.string().optional(),
    // Resume only (src/pages/resume.astro).
    resume: z
      .object({
        role: z.string(),
        location: z.string(),
        dates: z.string(),
        highlights: z.array(z.string()).default([]),
      })
      .optional(),
  }),
});

const books = defineCollection({
  loader: goodreadsLoader({
    userId: site.goodreads.userId,
    shelves: ['currently-reading', 'favorites', 'software-engineering'],
  }),
  schema: z.object({
    // A book on several shelves has one entry per shelf.
    shelf: z.string(),
    // Order within the shelf's feed.
    position: z.number().int(),
    title: z.string(),
    subtitle: z.string().optional(),
    author: z.string(),
    // 0 means not rated.
    rating: z.number().int().min(0).max(5),
    toRead: z.boolean(),
    readAt: z.coerce.date().nullable(),
    addedAt: z.coerce.date(),
    cover: z.url().optional(),
    href: z.url(),
  }),
});

export const collections = { posts, experience, projects, writing, teaching, books };
