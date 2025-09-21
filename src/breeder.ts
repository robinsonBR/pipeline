import { z } from "zod";
import { ModelPrompt, ModelResponse, promptModel } from "./prompt.js";
import { search } from "./search.js";
import { fetchHtml } from "./fetchHtml.js";

const BreederSchemaObject = z.object({
  description: z
    .string()
    .describe(
      "A description of the company based on the information found on its website, e.g. 'Aficionado Seeds is a cannabis breeder that specializes in breeding cannabis seeds and strains.'"
    ),
  location: z
    .string()
    .describe(
      "The city, state and country where the company is located based on the information found on its website, e.g. 'Los Angeles, CA, USA' or 'Califorina, USA' or 'USA'"
    ),
  socialMedia: z
    .array(z.url())
    .describe(
      "An array of URLs, without prefix, labels or other text, to any of the company's social media profiles based on the information found on its website, e.g. '[\"https://www.instagram.com/aficionadoestates\"]'"
    ),
});

export const BreederSchema = z.toJSONSchema(BreederSchemaObject);
export type ExtractedData = z.infer<typeof BreederSchemaObject>;

function breederPrompt(breeder: string, html: string): ModelPrompt {
  const messages = [
    {
      role: "system",
      content:
        "You are a helpful assistant that extracts important company information from the HTML of its website. You must respond in JSON format.\n" +
        "DO NOT comment on the website layout, HTML, javascript, markup, code, issues, fixes or any other technical implementation details.\n" +
        "Carefully obey the given JSON schema and do not include any additional information or comments.  For any fields that are not present in the HTML, return an empty string.\n",
    },
    {
      role: "user",
      content: `Extract information in JSON format about the company ${breeder} from the HTML of its website:\n\n${html}.`,
    },
  ];

  return { messages, schema: BreederSchema };
}

/*

  Pipeline for a single breeder:

  * Search for the official website of the breeder
  * Fetch the HTML content of the top search result
  * Create the prompt for the model
  * Ask the model to extract the breeder information

  Example output ('phi4-mini-reasoning:latest', 'Bodhi Seeds'):

  {
    "description": "Bodhi Seeds is a pioneering brand in the cannabis industry, dedicated to preserving rare and exotic strains of Cannabis from around the world. They are committed to maintaining genetic diversity and integrity through careful breeding and selection processes.",
    "location": "",
    "socialMedia": ["https://www.instagram.com/plantmoreseeds"]
  }

  NB: One thing I noticed is that when the search results do include the 
  official website, the snippet for that result generally already contains a 
  reasonable value for the description field.  This might mean we don't need to 
  prompt the model to extract the description.

*/
export async function breederPipeline(
  model: string,
  breeder: string
): Promise<ModelResponse> {
  const startTime = Date.now();
  // Search for the official website of the breeder
  const results = await search(breeder + " Official Website");

  if (
    results.length === 0 ||
    results[0].link === null ||
    results[0].link === undefined
  ) {
    return {
      content: "No results found",
      duration: (Date.now() - startTime) / 1000,
    };
  }
  console.log("Completed Google search. (Top result: " + results[0].link + ")");
  // Fetch the HTML content of the top search result
  const html = await fetchHtml({ url: results[0].link, scrub: true });
  console.log("Completed HTML fetch for top result.");

  // Ask the model to extract the breeder information
  const response = await promptModel(model, breederPrompt(breeder, html));
  console.log("Model response generated.");

  return {
    content: response.content,
    duration: (Date.now() - startTime) / 1000,
  };
}
