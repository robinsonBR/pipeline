import { readFileSync, writeFileSync } from "fs";
import { fetchHtml } from "./src/fetchHtml.js";

type TransformedBreeder = {
  name: string;
  link: string;
  snippet: string;
  location: string;
  socialMediaLinks: string;
};

// Extract social media specific content from HTML
function extractSocialMediaContent(htmlContent: string): string {
  // First extract potential social media URLs using regex
  const socialUrls = htmlContent.match(/https?:\/\/[^\s"'<>]*(?:instagram|twitter|x\.com|facebook|linkedin|youtube|tiktok|t\.co)[^\s"'<>]*/gi) || [];

  // Extract text content around social media keywords
  const socialKeywords = ['instagram', 'twitter', 'facebook', 'linkedin', 'youtube', 'tiktok', 'follow us', 'social media', '@'];
  let relevantContent = '';

  for (const keyword of socialKeywords) {
    const regex = new RegExp(`.{0,100}${keyword}.{0,100}`, 'gi');
    const matches = htmlContent.match(regex) || [];
    relevantContent += matches.join(' ') + ' ';
  }

  // Combine URLs and relevant text content
  const combinedContent = [...socialUrls, relevantContent].join(' ');

  // Limit to reasonable size for LLM
  return combinedContent.substring(0, 3000);
}

// Send request to Ollama
async function askOllama(socialContent: string): Promise<string> {
  try {
    const prompt = `Find all social media links in this content. Look for Instagram, Twitter/X, Facebook, LinkedIn, YouTube, and TikTok links. Return only the URLs as a comma-separated list, or return 'none' if no social media links are found.

Content:
${socialContent}`;

    const response = await fetch('http://localhost:11434/api/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'phi3:mini',
        prompt: prompt,
        stream: false,
        options: {
          temperature: 0.1,
          top_p: 0.9,
        }
      }),
    });

    if (!response.ok) {
      throw new Error(`Ollama API error: ${response.status}`);
    }

    const data = await response.json();
    return data.response || '';
  } catch (error) {
    console.error('Ollama error:', error);
    return '';
  }
}

// Clean up and validate social media links
function cleanSocialMediaLinks(response: string): string {
  if (!response || response.toLowerCase().includes('none')) {
    return '';
  }

  // Extract URLs using regex
  const urlRegex = /https?:\/\/[^\s,]+/g;
  const urls = response.match(urlRegex) || [];

  // Filter for social media domains
  const socialMediaDomains = [
    'instagram.com', 'twitter.com', 'x.com', 'facebook.com',
    'linkedin.com', 'youtube.com', 'tiktok.com', 't.co'
  ];

  const validUrls = urls.filter(url =>
    socialMediaDomains.some(domain => url.toLowerCase().includes(domain))
  );

  return validUrls.join(', ');
}

// Extract social media links for a single company
async function extractSocialMediaForCompany(url: string): Promise<string> {
  try {
    console.log(`  Fetching HTML from: ${url}`);

    // Fetch and scrub HTML content
    const htmlContent = await fetchHtml({
      url: url,
      scrub: true
    });

    const socialContent = extractSocialMediaContent(htmlContent);
    console.log(`  Sending to Ollama (${socialContent.length} chars from ${htmlContent.length} original)...`);

    // Send to Ollama for analysis
    const ollamaResponse = await askOllama(socialContent);

    console.log(`  Ollama response: ${ollamaResponse.substring(0, 200)}...`);

    // Clean and validate the response
    const socialMediaLinks = cleanSocialMediaLinks(ollamaResponse);

    return socialMediaLinks;
  } catch (error) {
    console.error(`  Error processing ${url}:`, error);
    return '';
  }
}

// Main execution
async function main() {
  const [,, inputFile, outputFile] = process.argv;

  if (!inputFile || !outputFile) {
    console.error("Usage: tsx extractSocialMedia.ts <input.json> <output.json>");
    process.exit(1);
  }

  const data: TransformedBreeder[] = JSON.parse(readFileSync(inputFile, 'utf8'));

  console.log(`Processing ${data.length} breeders for social media extraction...`);
  console.log("Using Ollama model: llama3.1:8b");

  for (let i = 0; i < data.length; i++) {
    const breeder = data[i];
    console.log(`\n[${i + 1}/${data.length}] Processing: ${breeder.name}`);

    if (breeder.link) {
      const socialMediaLinks = await extractSocialMediaForCompany(breeder.link);

      if (socialMediaLinks) {
        breeder.socialMediaLinks = socialMediaLinks;
        console.log(`  ✓ Found: ${socialMediaLinks}`);
      } else {
        console.log(`  - No social media links found`);
      }
    } else {
      console.log(`  - No link available`);
    }

    // Save progress after each entry
    writeFileSync(outputFile, JSON.stringify(data, null, 2));

    // Respectful delay
    await new Promise(resolve => setTimeout(resolve, 2000));
  }

  const foundCount = data.filter(b => b.socialMediaLinks).length;
  console.log(`\nCompleted! Found social media links for ${foundCount}/${data.length} breeders.`);
  console.log(`Results saved to ${outputFile}`);
}

main().catch(console.error);