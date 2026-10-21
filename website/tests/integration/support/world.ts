/**
 * @file world.ts
 * @author Jimmy Kurian
 * @copyright Copyright (c) 2026 Jimmy Kurian. All rights reserved. See LICENSE.
 */

import { setWorldConstructor, World } from '@cucumber/cucumber';

/**
 * Each scenario's state. A When step stores what it found under a name, and the Then steps
 * read it back, so Given, When and Then stay Arrange, Act and Assert.
 */
export class SiteWorld extends World {
  private readonly found = new Map<string, unknown>();

  /** Stores a value for the scenario's later steps. */
  remember<T>(name: string, value: T): T {
    this.found.set(name, value);
    return value;
  }

  /** Reads a value an earlier step stored, failing if none did. */
  recall<T>(name: string): T {
    if (!this.found.has(name)) throw new Error(`No earlier step stored "${name}"`);
    return this.found.get(name) as T;
  }
}

setWorldConstructor(SiteWorld);
