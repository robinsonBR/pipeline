import { google } from "googleapis";

const searchClient = google.customsearch("v1");
const apiKey = "AIzaSyACJOOfzhVMb8DBGjL5yDxpdk1QjbLRCtc";
const searchEngineId = "66d86c1fcbb6747e7";

/**
 * Represents a single search result item from the Google Custom Search API.
 * 
 * @interface SearchItem
 * @property {string | null} [title] - The title of the search result page
 * @property {string | null} [link] - The URL link to the search result page
 * @property {string | null} [snippet] - A brief text excerpt from the search result page
 */
export type SearchItem = {
  title?: string | null;
  link?: string | null;
  snippet?: string | null;
};

/**
 * Performs a custom Google search using the Google Custom Search API.
 * 
 * @param query - The search query string to execute
 * @returns A promise that resolves to an array of SearchItem objects containing
 *          title, link, and snippet for each search result. Returns an empty array
 *          if no results are found.
 * @throws Will throw an error if the Google Custom Search API request fails
 * 
 * @example
 * ```typescript
 * const results = await search("Aficionado Seeds Official Website");
 * console.log(results[0].title); // First result title
 * ```
 */
export async function search(query: string): Promise<SearchItem[]> {
  try {
    const response = await searchClient.cse.list({
      auth: apiKey,
      cx: searchEngineId,
      q: query,
    });

    return response.data.items
      ? response.data.items.map((item) => ({
          title: item.title,
          link: item.link,
          snippet: item.snippet,
        }))
      : [];
  } catch (error) {
    console.error("Error performing custom search: ", error);
    throw error;
  }
}
