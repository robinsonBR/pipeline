import { Ollama, Message } from "ollama";
import fetch from "node-fetch";
import { z } from "zod";

const ollama = new Ollama({
  fetch: fetch as any
});

export interface ModelPrompt {
  messages: Message[];
  schema?: z.core.JSONSchema.BaseSchema;
};

export interface ModelResponse {
  content: string;
  duration: number;
};

/**
 * Extracts structured data from messages using an Ollama model with optional schema validation.
 *
 * @param model - The name of the Ollama model to use for extraction
 * @param messages - Array of messages to process for data extraction
 * @param schema - Optional Zod JSON schema to enforce structured output format
 * @returns Promise resolving to an object containing the extracted content and processing duration
 * @returns {Promise<{content: string, duration: number}>} The extracted content and total processing duration in nanoseconds
 *
 * @example
 * ```typescript
 * const messages = [{ role: 'user', content: 'Extract the name from: John Doe is 30 years old' }];
 * const result = await extract('llama2', messages);
 * console.log(result.content); // Extracted content
 * console.log(result.duration); // Processing time in nanoseconds
 * ```
 */
export async function promptModel(
  model: string,
  prompt: ModelPrompt
): Promise<ModelResponse> {
  const response = await ollama.chat({
    model: model,
    messages: prompt.messages,
    format: prompt.schema,
    stream: false,
    options: {
      num_ctx: 32768,
      temperature: 0,
    },
  });

  return {
    content: response.message.content,
    duration: response.total_duration / 1_000_000_000,
  };
}
