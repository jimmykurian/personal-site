import { vi } from 'vitest';

// Smallest PNG header Astro's size probe accepts: signature plus an IHDR chunk.
function pngHeader(width: number, height: number): Uint8Array<ArrayBuffer> {
  const ihdr = Buffer.alloc(25);
  ihdr.writeUInt32BE(13, 0);
  ihdr.write('IHDR', 4, 'ascii');
  ihdr.writeUInt32BE(width, 8);
  ihdr.writeUInt32BE(height, 12);
  ihdr.set([8, 6, 0, 0, 0], 16);
  return new Uint8Array(Buffer.concat([Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]), ihdr]));
}

/**
 * Answers the `inferSize` probe for remote covers with a 2:3 image, so pages that show
 * Goodreads covers render offline. Returns the mock to assert on the requested URLs.
 */
export function stubRemoteImages(width = 300, height = 450) {
  const fetch = vi.fn(async (url: string | URL | Request) => {
    const response = new Response(pngHeader(width, height), { headers: { 'content-type': 'image/png' } });
    // Astro checks the final URL against image.domains, and a constructed Response has none.
    Object.defineProperty(response, 'url', { value: String(url instanceof Request ? url.url : url) });
    return response;
  });
  vi.stubGlobal('fetch', fetch);
  return fetch;
}
