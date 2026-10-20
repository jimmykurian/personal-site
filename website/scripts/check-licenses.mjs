// Checks the license of every installed package (task lint:licenses). The allowed SPDX ids and
// the excluded packages are in ../.config/licenses/. It reads each package's package.json in
// node_modules, so it needs no network and no pnpm store.
import { existsSync, lstatSync, readFileSync, readdirSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

/** Lines of a list file, without `#` comments and blank lines. */
export function readList(file) {
  return readFileSync(file, 'utf8')
    .split('\n')
    .map((line) => line.replace(/#.*/, '').trim())
    .filter(Boolean);
}

/** True if `value` matches a pattern, where `*` stands for any characters. */
export function matches(value, pattern) {
  const regex = new RegExp(`^${pattern.split('*').map(escape).join('.*')}$`, 'i');
  return regex.test(value);
}
const escape = (s) => s.replace(/[.+?^${}()|[\]\\]/g, '\\$&');

/**
 * Whether an SPDX expression is allowed: an id must match a pattern in `allowed`; with OR,
 * any side may; with AND, every side must. `X WITH exception` counts as X. A malformed
 * expression isn't allowed.
 */
export function isAllowed(expression, allowed) {
  const tokens = expression
    .replace(/[()]/g, ' $& ')
    .split(/\s+/)
    .filter(Boolean)
    .reduce((out, token, i, all) => {
      // Drop "WITH <exception>": the base license decides.
      if (/^with$/i.test(token) || /^with$/i.test(all[i - 1] ?? '')) return out;
      return [...out, token];
    }, []);
  let at = 0;
  const peek = () => tokens[at];
  const isOp = (token, op) => new RegExp(`^${op}$`, 'i').test(token ?? '');

  function atom() {
    const token = tokens[at++];
    if (token === undefined || token === ')' || isOp(token, 'and') || isOp(token, 'or')) throw new Error('malformed');
    if (token === '(') {
      const value = or();
      if (tokens[at++] !== ')') throw new Error('malformed');
      return value;
    }
    return allowed.some((pattern) => matches(token, pattern));
  }
  function and() {
    let value = atom();
    while (isOp(peek(), 'and')) {
      at++;
      value = atom() && value;
    }
    return value;
  }
  function or() {
    let value = and();
    while (isOp(peek(), 'or')) {
      at++;
      value = and() || value;
    }
    return value;
  }

  try {
    const value = or();
    return at === tokens.length && value;
  } catch {
    return false;
  }
}

/**
 * A package's license as one SPDX expression, from `license` or the legacy `licenses`. Either
 * may be a string, a { type } object, or a list of them, which means a choice (OR).
 */
export function licenseOf(manifest) {
  const type = (entry) => (typeof entry === 'string' ? entry : entry?.type);
  for (const field of [manifest.license, manifest.licenses]) {
    if (Array.isArray(field) && field.length) return field.map(type).join(' OR ');
    if (field && !Array.isArray(field)) return type(field);
  }
  return undefined;
}

/** Every package pnpm installed: { name, version, license } from node_modules/.pnpm. */
export function installedPackages(nodeModules) {
  const store = join(nodeModules, '.pnpm');
  const seen = new Map();
  for (const entry of readdirSync(store)) {
    const modules = join(store, entry, 'node_modules');
    if (!existsSync(modules)) continue;
    for (const top of readdirSync(modules)) {
      const names = top.startsWith('@') ? readdirSync(join(modules, top)).map((n) => `${top}/${n}`) : [top];
      for (const name of names) {
        const dir = join(modules, name);
        // Symlinks are this package's dependencies; each is read from its own entry.
        if (lstatSync(dir).isSymbolicLink() || !existsSync(join(dir, 'package.json'))) continue;
        const manifest = JSON.parse(readFileSync(join(dir, 'package.json'), 'utf8'));
        seen.set(`${manifest.name}@${manifest.version}`, {
          name: manifest.name,
          version: manifest.version,
          license: licenseOf(manifest),
        });
      }
    }
  }
  return [...seen.values()];
}

/** Packages whose license isn't allowed, and exclusions that matched no package. */
export function check(packages, allowed, excluded) {
  const used = new Set();
  const failures = [];
  for (const pkg of packages) {
    const exclusion = excluded.find((pattern) => matches(pkg.name, pattern));
    if (exclusion) {
      used.add(exclusion);
      continue;
    }
    if (!pkg.license || !isAllowed(pkg.license, allowed)) failures.push(pkg);
  }
  return { failures, unused: excluded.filter((pattern) => !used.has(pattern)) };
}

function main() {
  const website = resolve(dirname(fileURLToPath(import.meta.url)), '..');
  const config = join(website, '..', '.config', 'licenses');
  const nodeModules = join(website, 'node_modules');
  if (!existsSync(join(nodeModules, '.pnpm'))) {
    console.error('lint:licenses: no node_modules; run `task install` first');
    process.exit(1);
  }
  const packages = installedPackages(nodeModules);
  const { failures, unused } = check(
    packages,
    readList(join(config, 'allowed.txt')),
    readList(join(config, 'excluded.txt')),
  );
  for (const { name, version, license } of failures) {
    console.error(`lint:licenses: ${name}@${version} has ${license ? `license "${license}"` : 'no license'}`);
  }
  for (const pattern of unused) {
    console.error(`lint:licenses: exclusion "${pattern}" matches no installed package; remove it`);
  }
  if (packages.length === 0 || failures.length || unused.length) process.exit(1);
  console.log(`lint:licenses: ${packages.length} packages, all licenses allowed`);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) main();
