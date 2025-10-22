import * as fs from 'fs';

function extractPlatformFromUrl(url) {
  const urlLower = url.toLowerCase();

  if (urlLower.includes('instagram.com')) return 'instagram';
  if (urlLower.includes('facebook.com')) return 'facebook';
  if (urlLower.includes('twitter.com') || urlLower.includes('x.com')) return 'twitter';
  if (urlLower.includes('linkedin.com')) return 'linkedin';
  if (urlLower.includes('youtube.com')) return 'youtube';
  if (urlLower.includes('tiktok.com')) return 'tiktok';

  return null;
}

function extractLabelFromUrl(url, platform) {
  try {
    const urlObj = new URL(url);
    const pathname = urlObj.pathname.replace(/\/$/, '');
    const parts = pathname.split('/').filter(p => p.length > 0);

    if (parts.length === 0) return '';

    if (platform === 'instagram' || platform === 'twitter') {
      return '@' + parts[parts.length - 1];
    }

    return parts[parts.length - 1];
  } catch (e) {
    return '';
  }
}

function transformSocialMediaLinks(socialMediaLinksString) {
  if (!socialMediaLinksString || socialMediaLinksString.trim() === '') {
    return [];
  }

  const urls = socialMediaLinksString.split(',').map(url => url.trim()).filter(url => url.length > 0);
  const result = [];

  for (const url of urls) {
    const platform = extractPlatformFromUrl(url);
    if (platform) {
      const label = extractLabelFromUrl(url, platform);
      if (label) {
        result.push({ network: platform, label: label });
      }
    }
  }

  return result;
}

const data = JSON.parse(fs.readFileSync('batch4_with_social_311-410.json', 'utf-8'));

const transformed = data.map(entry => ({
  ...entry,
  socialMediaLinks: typeof entry.socialMediaLinks === 'string' ? transformSocialMediaLinks(entry.socialMediaLinks) : entry.socialMediaLinks
}));

fs.writeFileSync('batch4_final_311-410.json', JSON.stringify(transformed, null, 2), 'utf-8');

console.log('Transformation complete!');
console.log('Total entries:', transformed.length);
console.log('Entries with social media:', transformed.filter(e => Array.isArray(e.socialMediaLinks) && e.socialMediaLinks.length > 0).length);
