import { search, SearchItem } from "./search.js";
import { writeFileSync, readFileSync } from "fs";

type ResultItem = { name: string; searchResults: SearchItem[]; }

const [,, input, type, output] = process.argv;
const names: string[] = JSON.parse(readFileSync(input, 'utf8'));
const querySuffix = type === 'breeders' ? ' cannabis seeds official website' : ' cannabis grow official website';
const results: ResultItem[] = [];

for (const name of names) {
  const searchResults = await search(name + querySuffix);
  results.push({ name, searchResults });
  writeFileSync(output, JSON.stringify(results, null, 2));
}