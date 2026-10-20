/**
 * @file container.ts
 * @author Jimmy Kurian
 * @copyright Copyright (c) 2026 Jimmy Kurian. All rights reserved. See LICENSE.
 */

import { experimental_AstroContainer as AstroContainer, type ContainerRenderOptions } from 'astro/container';
import { parse } from 'node-html-parser';
import type { AstroComponentFactory } from 'astro/runtime/server/index.js';

export const SITE = 'https://www.jimmykurian.me';

/** Renders a component or page the way the build does, at `path` on the live site. */
export async function render(
  component: AstroComponentFactory,
  { path = '/', ...options }: ContainerRenderOptions & { path?: string } = {},
): Promise<string> {
  const container = await AstroContainer.create({ astroConfig: { site: SITE } });
  return container.renderToString(component, { request: new Request(new URL(path, SITE)), ...options });
}

/** Rendered HTML as a queryable tree. */
export const dom = (html: string) => parse(html);

/**
 * HTML with the parts that change between machines or Astro releases removed, one tag per
 * line, for snapshots: scoped-style attributes, generated image URLs and the generator tag.
 */
export function normalize(html: string): string {
  return html
    .replace(/\s*data-astro-cid-[a-z0-9]+(="[^"]*")?/g, '')
    .replace(/\/_image\/?\?[^"\s]+/g, '/_image?…')
    .replace(/<meta name="generator"[^>]*>/g, '')
    .replace(/>\s*</g, '>\n<')
    .trim();
}
