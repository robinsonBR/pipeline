import { search, SearchItem } from "./search.js";
import { writeFileSync, readFileSync } from "fs";

export type BreederWithSearchResults = {
  name: string;
  searchResults: SearchItem[];
};

const [,, input, type, output] = process.argv;

if (!input || !type || !output) {
  console.error("Usage: tsx src/collectSearchResults.ts <input.json> <type> <output.json>");
  process.exit(1);
}

const names: string[] = JSON.parse(readFileSync(input, 'utf8'));
const querySuffix = type === 'breeders' ? ' cannabis seeds official website' : ' cannabis grow official website';
const results: BreederWithSearchResults[] = [];

for (const name of names) {
  try {
    console.log(`Searching for: ${name}`);
    const searchResults = await search(name + querySuffix);

    const result: BreederWithSearchResults = {
      name: name,
      searchResults
    };

    results.push(result);

    // Write after each entry for progress tracking
    writeFileSync(output, JSON.stringify(results, null, 2));

    console.log(`Completed search for ${name} (${searchResults.length} results)`);

  } catch (error) {
    console.error(`Error searching for ${name}:`, error);

    // Add empty result for failed searches
    results.push({
      name: name,
      searchResults: []
    });

    writeFileSync(output, JSON.stringify(results, null, 2));
  }
}

console.log(`Search collection complete! Results saved to ${output}`);