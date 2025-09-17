import { search, SearchItem } from "./search.js";

interface QueryTestResult {
  query: string;
  results: SearchItem[];
  relevanceScore: number;
}

const CANNABIS_KEYWORDS = [
  'cannabis', 'seed', 'strain', 'genetics', 'breeder', 'cultivation',
  'hemp', 'marijuana', 'weed', 'grow', 'dispensary', 'thc', 'cbd'
];

function calculateRelevanceScore(results: SearchItem[]): number {
  if (!results.length) return 0;

  let score = 0;
  const topResult = results[0];

  // Check title, link, and snippet for cannabis-related keywords
  const textToCheck = [
    topResult.title || '',
    topResult.link || '',
    topResult.snippet || ''
  ].join(' ').toLowerCase();

  const keywordMatches = CANNABIS_KEYWORDS.filter(keyword =>
    textToCheck.includes(keyword)
  ).length;

  // Score based on keyword matches (max 10 points)
  score += Math.min(keywordMatches * 2, 10);

  // Bonus if the domain looks cannabis-related
  const domain = topResult.link?.toLowerCase() || '';
  if (domain.includes('seed') || domain.includes('cannabis') || domain.includes('strain')) {
    score += 5;
  }

  return score;
}

async function testQueryVariations(breeder: string): Promise<QueryTestResult[]> {
  const queryTemplates = [
    `${breeder} cannabis seeds official website`,
    `${breeder} cannabis breeder official website`,
    `${breeder} seed company official website`,
    `${breeder} official website`
  ];

  const results: QueryTestResult[] = [];

  for (const query of queryTemplates) {
    console.log(`\nTesting query: "${query}"`);
    try {
      const searchResults = await search(query);
      const relevanceScore = calculateRelevanceScore(searchResults);

      results.push({
        query,
        results: searchResults.slice(0, 3), // Top 3 results
        relevanceScore
      });

      console.log(`✓ Found ${searchResults.length} results, relevance score: ${relevanceScore}`);
    } catch (error) {
      console.error(`✗ Error with query "${query}":`, error);
      results.push({
        query,
        results: [],
        relevanceScore: 0
      });
    }
  }

  return results;
}

function displayResults(testResults: QueryTestResult[]) {
  console.log('\n' + '='.repeat(80));
  console.log('QUERY COMPARISON RESULTS');
  console.log('='.repeat(80));

  // Sort by relevance score (highest first)
  const sortedResults = [...testResults].sort((a, b) => b.relevanceScore - a.relevanceScore);

  sortedResults.forEach((result, index) => {
    console.log(`\n${index + 1}. QUERY: "${result.query}"`);
    console.log(`   RELEVANCE SCORE: ${result.relevanceScore}/15`);
    console.log(`   RESULTS (${result.results.length}):`);

    if (result.results.length === 0) {
      console.log('   No results found');
      return;
    }

    result.results.forEach((item, resultIndex) => {
      console.log(`\n   ${resultIndex + 1}. ${item.title || 'No title'}`);
      console.log(`      URL: ${item.link || 'No URL'}`);
      console.log(`      Snippet: ${item.snippet || 'No snippet'}`);
    });
  });

  console.log('\n' + '='.repeat(80));
  console.log('ANALYSIS SUMMARY');
  console.log('='.repeat(80));

  const bestResult = sortedResults[0];
  console.log(`Best performing query: "${bestResult.query}"`);
  console.log(`Best relevance score: ${bestResult.relevanceScore}/15`);

  if (bestResult.results.length > 0) {
    console.log(`Top result: ${bestResult.results[0].title}`);
    console.log(`Top result URL: ${bestResult.results[0].link}`);
  }
}

// Main execution
async function runQueryTest() {
  const breeder = "cookies";

  console.log(`Starting query variation test for breeder: "${breeder}"`);
  console.log('Testing 4 different query strategies...\n');

  try {
    const testResults = await testQueryVariations(breeder);
    displayResults(testResults);
  } catch (error) {
    console.error('Error running query test:', error);
  }
}

// Run the test
runQueryTest();