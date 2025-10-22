import { search, SearchItem } from "./search.js";
import { writeFileSync, readFileSync } from "fs";

export type BreederWithSearchResults = {
  name: string;
  searchResults: SearchItem[];
};

const [,, input, category, output] = process.argv;

if (!input || !category || !output) {
  console.error("Usage: tsx src/collectSearchResults.ts <input.json> <category> <output.json>");
  process.exit(1);
}

const categoryToSuffix: Record<string, string> = {
  'accessories': ' cannabis cultivation accessories official website',
  'environment': ' cannabis cultivation environment control official website',
  'lighting': ' cannabis grow lighting official website',
  'media_and_containers': ' cannabis growing media containers official website',
  'plant_nutrition_and_health': ' cannabis plant nutrients official website',
  'propagation': ' cannabis propagation cloning official website',
  'water_and_hydroponics': ' cannabis hydroponics watering systems official website',
  'breeders': ' cannabis breeder'
};

const names: string[] = JSON.parse(readFileSync(input, 'utf8'));
const querySuffix = categoryToSuffix[category] || ' cannabis cultivation official website';
const results: BreederWithSearchResults[] = [];

for (const name of names) {
  try {
    console.log(`Searching for: ${name}`);

    let searchResults = await search(name + querySuffix);

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