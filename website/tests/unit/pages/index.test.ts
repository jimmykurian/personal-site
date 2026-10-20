import { getCollection } from 'astro:content';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import HomePage from '../../../src/pages/index.astro';
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
  html = await render(HomePage);
});

describe('home page', () => {
  it('renders every section in order', () => {
    // Arrange
    const root = dom(html);

    // Act
    const ids = root.querySelectorAll('main > section').map((s) => s.id || s.classList.value[0]);

    // Assert
    expect(ids).toEqual([
      'hero',
      'focus',
      'experience',
      'service',
      'projects',
      'writing',
      'teaching',
      'resume',
      'contact',
    ]);
  });

  it('types through the rotating phrases, with the first one readable without JavaScript', () => {
    // Arrange
    const h1 = dom(html).querySelector('h1#hero-title')!;

    // Act
    const typed = h1.querySelector('em.typed')!;

    // Assert
    expect(JSON.parse(typed.getAttribute('data-phrases')!)).toEqual(site.headline.rotating);
    expect(typed.getAttribute('aria-hidden')).toBe('true');
    expect(typed.text).toBe(site.headline.emphasis);
    expect(h1.querySelector('.visually-hidden')!.text).toBe(site.headline.emphasis);
    // What a screen reader hears: the lead, a space, then the hidden copy of the phrase.
    expect(h1.text.replace(typed.text + '.', '').trim()).toBe(`${site.headline.lead} ${site.headline.emphasis}`);
  });

  it('links LinkedIn, GitHub, Stack Overflow and email from the hero, each with a name', () => {
    // Arrange
    const icons = dom(html).querySelectorAll('.hero__social a');

    // Act
    const links = icons.map((a) => [a.getAttribute('href'), a.getAttribute('aria-label')]);

    // Assert
    expect(links).toEqual([
      [site.links.linkedin, 'LinkedIn'],
      [site.links.github, 'GitHub'],
      [site.links.stackoverflow, 'Stack Overflow'],
      [`mailto:${site.email}`, `Email ${site.email}`],
    ]);
  });

  it('splits experience into civilian roles and military service', () => {
    // Arrange
    const root = dom(html);

    // Act
    const civilian = root.querySelectorAll('#experience .job').length;
    const military = root.querySelectorAll('#service .job').length;

    // Assert
    expect(civilian).toBe(experience.filter((e) => e.data.group === 'civilian').length);
    expect(military).toBe(experience.filter((e) => e.data.group === 'military').length);
    expect(root.querySelectorAll('#service .decorations__col').length).toBe(site.sections.service.decorations.length);
  });

  it('shows a logo for every role and project that names one', () => {
    // Arrange
    const root = dom(html);
    const named = [...experience, ...projects.filter((p) => !p.data.hidden)].filter((e) => e.data.logo).length;

    // Act
    const logos = root.querySelectorAll('img.job__logo');

    // Assert
    expect(logos).toHaveLength(named);
    expect(logos.every((img) => img.getAttribute('alt') === '' && img.getAttribute('width'))).toBe(true);
  });

  it('leaves hidden projects off', () => {
    // Arrange
    const visible = projects.filter((p) => !p.data.hidden).map((p) => p.data.title);

    // Act
    const shown = dom(html)
      .querySelectorAll('#projects .work__item .entry-title')
      .map((h) => h.text);

    // Assert
    expect(shown).toEqual(visible);
  });

  it('features only the writing marked featured', () => {
    // Arrange
    const featured = writing.filter((w) => w.data.featured).map((w) => w.data.title);

    // Act
    const shown = dom(html)
      .querySelectorAll('#writing .list-title')
      .map((t) => t.text.trim());

    // Assert
    expect(shown.sort()).toEqual(featured.sort());
  });

  it('groups teaching into its columns and volunteering', () => {
    // Arrange
    const count = (group: string) => teaching.filter((t) => t.data.group === group).length;

    // Act
    const columns = dom(html)
      .querySelectorAll('#teaching .columns__col')
      .map((c) => c.querySelectorAll('li').length);
    const volunteering = dom(html).querySelectorAll('#teaching .volunteering__row').length;

    // Assert
    expect(columns).toEqual([count('teaching'), count('speaking'), count('community')]);
    expect(volunteering).toBe(count('volunteering'));
  });

  it('offers the resume PDF and the public contact address', () => {
    // Arrange
    const root = dom(html);

    // Act
    const resume = root.querySelector('#resume a.btn')!.getAttribute('href');
    const email = root.querySelector('.contact__email')!;

    // Assert
    expect(resume).toBe('/resume.pdf');
    expect(site.email).toBe('hello@jimmykurian.me');
    expect([email.getAttribute('href'), email.text]).toEqual(['mailto:hello@jimmykurian.me', 'hello@jimmykurian.me']);
  });

  it.each(Object.entries(forbidden))('never shows %s', (_, pattern) => {
    // Arrange
    const text = textOf(html);

    // Act
    const match = text.match(pattern);

    // Assert
    expect(match?.[0]).toBeUndefined();
  });

  it('names the stealth project without a link', () => {
    // Arrange
    const stealth = projects.find((p) => p.data.logo === 'stealth');

    // Act
    const card = dom(html)
      .querySelectorAll('#projects .work__item')
      .find((c) => c.querySelector('.entry-title')!.text === stealth?.data.title);

    // Assert
    expect(stealth?.data.link).toBeUndefined();
    expect(card?.querySelector('a')).toBeNull();
    expect(card?.text).toContain('Currently in stealth.');
  });
});
