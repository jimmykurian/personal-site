import { getCollection } from 'astro:content';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import ResumePage from '../../../src/pages/resume.astro';
import site from '../../../src/data/site.json';
import { dom, render } from '../../support/container';
import { collectionStub, realEntries } from '../../support/content';
import { forbidden, textOf } from '../../support/rules';

vi.mock('astro:content', async (importOriginal) => ({
  ...(await importOriginal<typeof import('astro:content')>()),
  getCollection: vi.fn(),
}));

const experience = realEntries('experience');
const projects = realEntries('projects');
const writing = realEntries('writing');
const teaching = realEntries('teaching');

let html: string;

beforeEach(async () => {
  vi.mocked(getCollection).mockImplementation(
    collectionStub({ experience, projects, writing, teaching }) as typeof getCollection,
  );
  html = await render(ResumePage, { path: '/resume/' });
});

const section = (label: string) =>
  dom(html)
    .querySelectorAll('section.block')
    .find((s) => s.querySelector('h2.label')!.text === label);

describe('resume page', () => {
  it('stays out of search results; it only exists to be printed', () => {
    // Arrange
    const root = dom(html);

    // Act
    const robots = root.querySelector('meta[name="robots"]')!.getAttribute('content');

    // Assert
    expect(robots).toBe('noindex');
    expect(root.querySelector('title')!.text).toBe(`${site.name}, resume`);
  });

  it('lists only public contact details in the header', () => {
    // Arrange
    const links = dom(html).querySelectorAll('.contact a');

    // Act
    const contact = links.map((a) => [a.getAttribute('href'), a.text]);

    // Assert
    expect(contact).toEqual([
      ['mailto:hello@jimmykurian.me', 'hello@jimmykurian.me'],
      ['https://www.jimmykurian.me/', 'jimmykurian.me'],
      [site.links.linkedin, site.links.linkedin.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '')],
      [site.links.github, site.links.github.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '')],
    ]);
  });

  it('includes roles with resume details, leaving initial military training off', () => {
    // Arrange
    const civilian = experience.filter((e) => e.data.resume && e.data.group === 'civilian').length;
    const military = experience.filter((e) => e.data.resume && e.data.group === 'military' && !e.data.training).length;

    // Act
    const shown = ['Professional experience', 'Military experience'].map(
      (l) => section(l)!.querySelectorAll('article.entry').length,
    );

    // Assert
    expect(shown).toEqual([civilian, military]);
  });

  it('uses the resume wording for each role', () => {
    // Arrange
    const first = experience.find((e) => e.data.resume && e.data.group === 'civilian')!;

    // Act
    const entry = section('Professional experience')!.querySelector('article.entry')!;

    // Assert
    expect(entry.querySelector('strong')!.text).toBe(first.data.resume!.org ?? first.data.org);
    expect(entry.querySelector('em')!.text).toBe(first.data.resume!.title ?? first.data.role);
    expect(entry.querySelectorAll('.bullets li').map((li) => li.text)).toEqual(first.data.resume!.highlights);
  });

  it('groups degrees by school', () => {
    // Arrange
    const schools = new Set(site.resume.education.map((e) => e.school));

    // Act
    const entries = section('Education')!.querySelectorAll('.entry');

    // Assert
    expect(entries.map((e) => e.querySelector('strong')!.text)).toEqual([...schools]);
    expect(entries.reduce((n, e) => n + e.querySelectorAll('em').length, 0)).toBe(site.resume.education.length);
  });

  it('carries the profile from the site data', () => {
    // Arrange
    const profile = section('Profile')!;

    // Act
    const text = profile.querySelector('p')!.text;

    // Assert
    expect(text).toBe(site.resume.profile);
  });

  it.each(Object.entries(forbidden))('never shows %s', (_, pattern) => {
    // Arrange
    const text = textOf(html);

    // Act
    const match = text.match(pattern);

    // Assert
    expect(match?.[0]).toBeUndefined();
  });
});
