import * as fs from 'fs';

interface BrandEntry {
  name: string;
  link: string;
  snippet: string;
  socialMediaLinks: string | Record<string, string | string[]>;
}

function extractPlatformFromUrl(url: string): string | null {
  const urlLower = url.toLowerCase();

  if (urlLower.includes('instagram.com')) return 'instagram';
  if (urlLower.includes('facebook.com')) return 'facebook';
  if (urlLower.includes('twitter.com') || urlLower.includes('x.com')) return 'twitter';
  if (urlLower.includes('linkedin.com')) return 'linkedin';
  if (urlLower.includes('youtube.com')) return 'youtube';
  if (urlLower.includes('tiktok.com')) return 'tiktok';

  return null;
}

function transformSocialMediaLinks(socialMediaLinksString: string): Record<string, string | string[]> {
  if (!socialMediaLinksString || socialMediaLinksString.trim() === '') {
    return {};
  }

  const urls = socialMediaLinksString
    .split(',')
    .map(url => url.trim())
    .filter(url => url.length > 0);

  const result: Record<string, string | string[]> = {};

  for (const url of urls) {
    const platform = extractPlatformFromUrl(url);

    if (platform) {
      if (result[platform]) {
        // If platform already exists, convert to array or add to array
        if (Array.isArray(result[platform])) {
          (result[platform] as string[]).push(url);
        } else {
          result[platform] = [result[platform] as string, url];
        }
      } else {
        result[platform] = url;
      }
    }
  }

  return result;
}

// Test on a few entries first
function testTransformation() {
  const testCases = [
    "",
    "https://www.instagram.com/advancednutrientsofficial/, https://www.facebook.com/advancednutrients, https://www01.linkedin.com/company/advanced-nutrients-ltd-, https://www.youtube.com/user/advancednutrientsco",
    "https://www.facebook.com/AgeOldOrganics, https://twitter.com/ageoldorganics, https://www.facebook.com/AgeOldOrganics, https://twitter.com/ageoldorganics"
  ];

  console.log('Testing transformation function:\n');

  testCases.forEach((testCase, index) => {
    console.log(`Test case ${index + 1}:`);
    console.log('Input:', testCase);
    console.log('Output:', JSON.stringify(transformSocialMediaLinks(testCase), null, 2));
    console.log('---\n');
  });
}

// Transform the entire file
function transformFile() {
  const filePath = './libs/data/src/assets/brandSearchResults.json';
  const data: BrandEntry[] = JSON.parse(fs.readFileSync(filePath, 'utf-8'));

  console.log(`\nTransforming ${data.length} entries...\n`);

  const transformed = data.map(entry => ({
    ...entry,
    socialMediaLinks: typeof entry.socialMediaLinks === 'string'
      ? transformSocialMediaLinks(entry.socialMediaLinks)
      : entry.socialMediaLinks
  }));

  fs.writeFileSync(filePath, JSON.stringify(transformed, null, 2), 'utf-8');

  console.log('Transformation complete!');
  console.log(`File saved to: ${filePath}`);
}

// Run test first
if (process.argv.includes('--test')) {
  testTransformation();
} else if (process.argv.includes('--transform')) {
  transformFile();
} else {
  console.log('Usage:');
  console.log('  npm exec tsx transform-social-links.ts --test        # Test transformation');
  console.log('  npm exec tsx transform-social-links.ts --transform   # Transform entire file');
}
