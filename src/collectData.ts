import { breederPipeline, ExtractedData } from "./breeder.js";
import { writeFileSync, readFileSync } from "fs";

type ResultItem = {
  name: string;
  extractedData?: ExtractedData;
};

const [,, input, type, output] = process.argv;
const names: string[] = JSON.parse(readFileSync(input, 'utf8'));
const querySuffix = type === 'breeders' ? ' cannabis seeds official website' : ' cannabis grow official website';
const results: ResultItem[] = [];

for (const name of names) {
  try {
    const response = await breederPipeline("llama3.1:8b", name + querySuffix);
    const extractedData: ExtractedData = JSON.parse(response.content);
    results.push({ name, extractedData });
  } catch (error) {
    console.error(`Error processing ${name}:`, error);
    results.push({ name });
  }
  writeFileSync(output, JSON.stringify(results, null, 2));
}