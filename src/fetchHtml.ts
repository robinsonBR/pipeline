/**
 * Fetches HTML content from a given URL with optional content scrubbing.
 *
 * @param args - Configuration object for the fetch operation
 * @param args.url - The URL to fetch HTML content from
 * @param args.scrub - Optional flag to remove script, style, svg, link, and input tags from the HTML content
 * @returns Promise that resolves to the HTML content as a string
 *
 * @example
 * ```typescript
 * // Fetch raw HTML
 * const html = await fetchHtml({ url: 'https://example.com' });
 *
 * // Fetch HTML with scrubbing enabled
 * const cleanHtml = await fetchHtml({ url: 'https://example.com', scrub: true });
 * ```
 */
export async function fetchHtml(args: {
  url: string;
  scrub?: boolean;
}): Promise<string> {
  let response = await fetch(args.url, {
    signal: AbortSignal.timeout(10000),
  })
    .then((response) => response.text())
    .then((response) => (args.scrub ? scrubHtml(response) : response));

  return response;
}

function scrubHtml(html: string): string {
  return html
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, " ")
    .replace(/<style\b[^>]*>[\s\S]*?<\/style>/g, " ")
    .replace(/<svg\b[^>]*>[\s\S]*?<\/svg>/gi, " ")
    .replace(/<link rel='stylesheet'\b[^>]*\/>/gi, " ")
    .replace(/<input\b[^>]*\/>/gi, " ");
}
