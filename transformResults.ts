import { readFileSync, writeFileSync } from "fs";

type SearchResult = {
  title?: string | null;
  link?: string | null;
  snippet?: string | null;
};

type BreederWithSearchResults = {
  name: string;
  searchResults: SearchResult[];
};

type TransformedBreeder = {
  name: string;
  link: string;
  snippet: string;
  location: string;
  socialMediaLinks: string;
};

const [,, inputFile, outputFile] = process.argv;

if (!inputFile || !outputFile) {
  console.error("Usage: tsx transformResults.ts <input.json> <output.json>");
  process.exit(1);
}

const data: BreederWithSearchResults[] = JSON.parse(readFileSync(inputFile, 'utf8'));

const transformed: TransformedBreeder[] = data.map(breeder => ({
  name: breeder.name,
  link: breeder.searchResults[0]?.link || "",
  snippet: breeder.searchResults[0]?.snippet || "",
  location: "",
  socialMediaLinks: ""
}));

writeFileSync(outputFile, JSON.stringify(transformed, null, 2));
console.log(`Transformed ${data.length} breeders. Results saved to ${outputFile}`);