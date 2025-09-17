import { search, SearchItem } from "./search.js";

interface BrandQueryTestResult {
  brand: string;
  query: string;
  results: SearchItem[];
  relevanceScore: number;
}

const CULTIVATION_KEYWORDS = [
  'cannabis', 'cultivation', 'grow', 'growing', 'hydroponic', 'hydroponics',
  'nutrients', 'fertilizer', 'soil', 'indoor', 'outdoor', 'greenhouse',
  'led', 'lighting', 'ventilation', 'ph', 'ec', 'ppm', 'bloom', 'veg',
  'organic', 'feed', 'supplement', 'additive', 'yield', 'harvest'
];

function calculateBrandRelevanceScore(results: SearchItem[]): number {
  if (!results.length) return 0;

  let score = 0;
  const topResult = results[0];

  // Check title, link, and snippet for cultivation-related keywords
  const textToCheck = [
    topResult.title || '',
    topResult.link || '',
    topResult.snippet || ''
  ].join(' ').toLowerCase();

  const keywordMatches = CULTIVATION_KEYWORDS.filter(keyword =>
    textToCheck.includes(keyword)
  ).length;

  // Score based on keyword matches (max 10 points)
  score += Math.min(keywordMatches * 2, 10);

  // Bonus if the domain looks cultivation-related
  const domain = topResult.link?.toLowerCase() || '';
  if (domain.includes('grow') || domain.includes('hydro') || domain.includes('nutrients') || domain.includes('cultivation')) {
    score += 5;
  }

  // Additional bonus for cannabis-specific cultivation terms
  if (textToCheck.includes('cannabis grow') || textToCheck.includes('cannabis cultivation') || textToCheck.includes('cannabis nutrients')) {
    score += 3;
  }

  return score;
}

async function testBrandQueryVariations(brand: string): Promise<BrandQueryTestResult[]> {
  const queryTemplates = [
    `${brand} cannabis cultivation official website`,
    `${brand} cannabis grow official website`,
    `${brand} cannabis nutrients official website`,
    `${brand} hydroponic official website`
  ];

  const results: BrandQueryTestResult[] = [];

  for (const query of queryTemplates) {
    console.log(`\nTesting query: "${query}"`);
    try {
      const searchResults = await search(query);
      const relevanceScore = calculateBrandRelevanceScore(searchResults);

      results.push({
        brand,
        query,
        results: searchResults.slice(0, 3), // Top 3 results
        relevanceScore
      });

      console.log(`✓ Found ${searchResults.length} results, relevance score: ${relevanceScore}`);
    } catch (error) {
      console.error(`✗ Error with query "${query}":`, error);
      results.push({
        brand,
        query,
        results: [],
        relevanceScore: 0
      });
    }
  }

  return results;
}

function displayBrandResults(allResults: BrandQueryTestResult[][]) {
  console.log('\n' + '='.repeat(80));
  console.log('BRAND QUERY COMPARISON RESULTS');
  console.log('='.repeat(80));

  allResults.forEach((brandResults, brandIndex) => {
    const brand = brandResults[0]?.brand || `Brand ${brandIndex + 1}`;
    console.log(`\n${'*'.repeat(60)}`);
    console.log(`BRAND: "${brand.toUpperCase()}"`);
    console.log(`${'*'.repeat(60)}`);

    // Sort by relevance score (highest first)
    const sortedResults = [...brandResults].sort((a, b) => b.relevanceScore - a.relevanceScore);

    sortedResults.forEach((result, index) => {
      console.log(`\n${index + 1}. QUERY: "${result.query}"`);
      console.log(`   RELEVANCE SCORE: ${result.relevanceScore}/18`);
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

    // Best result for this brand
    const bestResult = sortedResults[0];
    console.log(`\n   → BEST FOR "${brand}": "${bestResult.query}" (score: ${bestResult.relevanceScore})`);
    if (bestResult.results.length > 0) {
      console.log(`   → TOP RESULT: ${bestResult.results[0].title}`);
      console.log(`   → TOP URL: ${bestResult.results[0].link}`);
    }
  });

  console.log('\n' + '='.repeat(80));
  console.log('OVERALL ANALYSIS SUMMARY');
  console.log('='.repeat(80));

  // Find best query pattern across all brands
  const queryPatternScores: { [key: string]: number[] } = {};

  allResults.forEach(brandResults => {
    brandResults.forEach(result => {
      const pattern = result.query.replace(/^[^"]*?"([^"]*)".*/, '$1').replace(result.brand, '[BRAND]');
      if (!queryPatternScores[pattern]) {
        queryPatternScores[pattern] = [];
      }
      queryPatternScores[pattern].push(result.relevanceScore);
    });
  });

  console.log('\nQuery Pattern Performance (average scores):');
  Object.entries(queryPatternScores).forEach(([pattern, scores]) => {
    const avgScore = scores.reduce((a, b) => a + b, 0) / scores.length;
    console.log(`- "${pattern}": ${avgScore.toFixed(1)}/18`);
  });

  // Find the best overall pattern
  const bestPattern = Object.entries(queryPatternScores)
    .map(([pattern, scores]) => ({
      pattern,
      avgScore: scores.reduce((a, b) => a + b, 0) / scores.length
    }))
    .sort((a, b) => b.avgScore - a.avgScore)[0];

  console.log(`\nRECOMMENDED QUERY PATTERN: "${bestPattern.pattern}"`);
  console.log(`Average relevance score: ${bestPattern.avgScore.toFixed(1)}/18`);
}

// Main execution
async function runBrandQueryTest() {
  const brands = ["Phat", "Shear"];

  console.log(`Starting brand query variation test for brands: ${brands.join(', ')}`);
  console.log('Testing 4 different cultivation-focused query strategies...\n');

  try {
    const allResults: BrandQueryTestResult[][] = [];

    for (const brand of brands) {
      console.log(`\n${'='.repeat(40)}`);
      console.log(`Testing brand: "${brand}"`);
      console.log(`${'='.repeat(40)}`);

      const brandResults = await testBrandQueryVariations(brand);
      allResults.push(brandResults);
    }

    displayBrandResults(allResults);
  } catch (error) {
    console.error('Error running brand query test:', error);
  }
}

// Run the test
runBrandQueryTest();