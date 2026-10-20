// Patterns for details the content rules keep off the public site and resume. Real values
// are never written into the tests; these match the shape of the data instead.
export const forbidden = {
  'a personal Gmail address': /[\w.+-]+@gmail\.com/i,
  'a phone number': /(?:\+1[\s.-]?)?\(?\b\d{3}\)?[\s.-]\d{3}[\s.-]\d{4}\b/,
  'a security clearance': /\b(?:TS\/SCI|top secret|secret clearance|security clearance|clearance)\b/i,
  'a patent application number': /\b(?:\d{2}\/\d{3},\d{3}|US\s?\d{4}\/?\d{7}|application (?:no\.|number))/i,
  'a street address':
    /\b\d{1,6}\s+(?:[NSEW]\.?\s+)?[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*\s+(?:St|Street|Ave|Avenue|Rd|Road|Blvd|Dr|Drive|Ln|Lane|Ct|Court)\b\.?/,
};

/** Visible text plus the attribute values people or crawlers read, without scripts or styles. */
export function textOf(html: string): string {
  const page = html.replace(/<(script|style)[\s\S]*?<\/\1>/g, ' ');
  const attributes = [...page.matchAll(/\s(?:href|content|aria-label|title|alt)="([^"]*)"/g)].map((m) => m[1]);
  const text = page.replace(/<[^>]*>/g, ' ');
  return [text, ...attributes].join(' ').replace(/\s+/g, ' ');
}
