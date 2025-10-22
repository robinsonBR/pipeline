import * as fs from 'fs';

interface BrandEntry {
  name: string;
  link: string;
  snippet: string;
  location: string;
  socialMediaLinks: string | Array<{network: string; label: string}>;
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

function extractLabelFromUrl(url: string, platform: string): string {
  try {
    const urlObj = new URL(url);
    const pathname = urlObj.pathname.replace(/\/$/, '');
    const parts = pathname.split('/').filter(p => p.length > 0);

    if (parts.length === 0) return '';

    // For Instagram and Twitter, add @ prefix
    if (platform === 'instagram' || platform === 'twitter') {
      return '@' + parts[parts.length - 1];
    }

    // For others, just return the handle/username
    return parts[parts.length - 1];
  } catch (e) {
    return '';
  }
}

function transformSocialMediaLinks(socialMediaLinksString: string): Array<{network: string; label: string}> {
  if (!socialMediaLinksString || socialMediaLinksString.trim() === '') {
    return [];
  }

  const urls = socialMediaLinksString
    .split(',')
    .map(url => url.trim())
    .filter(url => url.length > 0);

  const result: Array<{network: string; label: string}> = [];

  for (const url of urls) {
    const platform = extractPlatformFromUrl(url);

    if (platform) {
      const label = extractLabelFromUrl(url, platform);
      if (label) {
        result.push({
          network: platform,
          label: label
        });
      }
    }
  }

  return result;
}

const inputPath = 'batch3_with_social_211-310.json';
const outputPath = 'batch3_final_211-310.json';

const data: BrandEntry[] = JSON.parse(fs.readFileSync(inputPath, 'utf-8'));

console.log(`\nTransforming ${data.length} entries...\n`);

const transformed = data.map(entry => ({
  ...entry,
  socialMediaLinks: typeof entry.socialMediaLinks === 'string'
    ? transformSocialMediaLinks(entry.socialMediaLinks)
    : entry.socialMediaLinks
}));

fs.writeFileSync(outputPath, JSON.stringify(transformed, null, 2), 'utf-8');

console.log('Transformation complete!');
console.log(`File saved to: ${outputPath}`);
console.log(`Total entries: ${transformed.length}`);
console.log(`Entries with social media: ${transformed.filter(e => Array.isArray(e.socialMediaLinks) && e.socialMediaLinks.length > 0).length}`);
