# AGENTS.md

## Commands
- **Run**: `npm start` (runs tsx src/index.ts)
- **Build**: `npm run build` (compiles TypeScript to dist/)
- **Run single file**: `tsx <filename>.ts`
- **No test suite configured**

## Architecture
- **Type**: Data pipeline for web scraping and LLM-based extraction
- **Main entry**: src/index.ts orchestrates breeder data collection pipeline
- **Core modules**: breeder.ts (schema + pipeline), search.ts (Google Custom Search), fetchHtml.ts (web scraping), prompt.ts (Ollama LLM integration)
- **Data flow**: Search → Fetch HTML → Extract with LLM (llama3.1:8b) → Validate with Zod
- **Output**: JSON files (batch results, search results, transformed data) in project root
- **External APIs**: Google Custom Search API, Ollama local LLM

## Code Style
- **TypeScript**: ES modules (type: "module"), strict mode enabled
- **Imports**: Use .js extension for local imports (e.g., "./breeder.js")
- **Module resolution**: "nodenext" - use Node.js ESM conventions
- **Validation**: Zod schemas for all data structures
- **Formatting**: No formatter configured - follow existing style
- **Types**: Infer types from Zod schemas using z.infer<typeof Schema>
- **Error handling**: No specific pattern - follow existing code
