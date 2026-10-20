import { describe, expect, it } from 'vitest';
import site from '../../src/data/site.json';
import { files, read } from '../support/dist';
import { forbidden, textOf } from '../support/rules';

// Everything a visitor or crawler can fetch as text.
const textFiles = () => files().filter((f) => /\.(html|xml|txt|json|svg)$/.test(f));

describe('content rules across the whole build', () => {
  it.each(Object.entries(forbidden))('no published file contains %s', (_, pattern) => {
    // Arrange
    const published = textFiles();

    // Act
    const hits = published.flatMap((f) => {
      const match = textOf(read(f)).match(pattern);
      return match ? [`${f}: ${match[0]}`] : [];
    });

    // Assert
    expect(hits).toEqual([]);
  });

  it('uses hello@ as the only email address', () => {
    // Arrange
    const published = textFiles().filter((f) => f.endsWith('.html') || f.endsWith('.xml'));

    // Act
    const addresses = new Set(published.flatMap((f) => read(f).match(/[\w.+-]+@[\w-]+\.[\w.]+/g) ?? []));

    // Assert
    expect([...addresses].filter((a) => !/\.(png|jpe?g|webp|svg|css|js)$/.test(a))).toEqual([site.email]);
  });

  it('never ships the private resume original', () => {
    // Arrange
    const published = files();

    // Act
    const privateFiles = published.filter((f) => f.startsWith('/private/') || /resume.*\.(docx?|txt)$/i.test(f));

    // Assert
    expect(privateFiles).toEqual([]);
  });
});
