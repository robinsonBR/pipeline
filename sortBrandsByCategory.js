import fs from 'fs';

function sortBrandsByCategory() {
  const brandCategories = JSON.parse(fs.readFileSync('brand_categories.json', 'utf8'));

  const categorizedBrands = {};

  Object.entries(brandCategories).forEach(([brand, categories]) => {
    categories.forEach(category => {
      if (!categorizedBrands[category]) {
        categorizedBrands[category] = [];
      }
      categorizedBrands[category].push(brand);
    });
  });

  // Sort brands within each category alphabetically
  Object.keys(categorizedBrands).forEach(category => {
    categorizedBrands[category].sort();
  });

  console.log('Categories found:');
  Object.keys(categorizedBrands).forEach(category => {
    console.log(`- ${category}: ${categorizedBrands[category].length} brands`);
  });

  // Save the sorted data
  fs.writeFileSync('brands_sorted_by_category.json', JSON.stringify(categorizedBrands, null, 2));
  console.log('\nSorted brands saved to brands_sorted_by_category.json');

  // Create batches for each category (50 brands per batch)
  const batchSize = 50;

  Object.entries(categorizedBrands).forEach(([category, brands]) => {
    const safeCategory = category.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase();
    const batches = [];

    for (let i = 0; i < brands.length; i += batchSize) {
      const batch = brands.slice(i, i + batchSize);
      const batchNum = Math.floor(i / batchSize) + 1;
      const startIdx = i + 1;
      const endIdx = Math.min(i + batchSize, brands.length);
      const filename = `${safeCategory}_batch${batchNum}_${startIdx}-${endIdx}.json`;

      fs.writeFileSync(filename, JSON.stringify(batch, null, 2));
      batches.push({
        filename,
        count: batch.length,
        range: `${startIdx}-${endIdx}`
      });

      console.log(`Created ${filename} with ${batch.length} brands`);
    }

    // Save batch summary for this category
    fs.writeFileSync(`${safeCategory}_batch_summary.json`, JSON.stringify({
      category,
      totalBrands: brands.length,
      batches
    }, null, 2));
  });

  console.log('\nBatch creation complete!');
}

sortBrandsByCategory();