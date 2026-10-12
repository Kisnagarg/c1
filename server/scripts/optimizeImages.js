const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const mongoose = require('mongoose');
const sharp = require('sharp');
const connectDB = require('../config/db');

async function compressDataUri(dataUri, maxDim = 800, quality = 80) {
  if (!dataUri || typeof dataUri !== 'string' || !dataUri.startsWith('data:image')) {
    return dataUri;
  }
  const commaIdx = dataUri.indexOf(',');
  if (commaIdx === -1) return dataUri;
  const base64Data = dataUri.substring(commaIdx + 1);
  const inputBuffer = Buffer.from(base64Data, 'base64');
  if (inputBuffer.length < 40 * 1024) return dataUri; // already small enough (<40KB)

  try {
    const outputBuffer = await sharp(inputBuffer)
      .resize({ width: maxDim, height: maxDim, fit: 'inside', withoutEnlargement: true })
      .jpeg({ quality })
      .toBuffer();

    console.log(`    ↳ Compressed ${(inputBuffer.length / 1024).toFixed(1)} KB down to ${(outputBuffer.length / 1024).toFixed(1)} KB`);
    return 'data:image/jpeg;base64,' + outputBuffer.toString('base64');
  } catch (err) {
    console.error('    ↳ Sharp compression error:', err.message);
    return dataUri;
  }
}

async function run() {
  console.log('Connecting to MongoDB Atlas...');
  await connectDB();
  const db = mongoose.connection.db;
  const prodCol = db.collection('products');
  const catCol = db.collection('categories');
  console.log('Connected to MongoDB via native collection driver!');

  // 1. PRODUCTS
  console.log('\n--- Checking Products ---');
  const products = await prodCol.find({}, { projection: { _id: 1, name: 1 } }).toArray();
  console.log(`Found ${products.length} products to evaluate.`);

  for (let i = 0; i < products.length; i++) {
    const item = products[i];
    console.log(`[${i + 1}/${products.length}] Processing product: "${item.name}" (${item._id})`);

    // 1a. Handle primary image
    const docWithImage = await prodCol.findOne({ _id: item._id }, { projection: { image: 1 } });
    if (docWithImage && docWithImage.image && docWithImage.image.startsWith('data:image')) {
      const origLen = docWithImage.image.length;
      const comp = await compressDataUri(docWithImage.image, 800, 80);
      if (comp.length !== origLen) {
        await prodCol.updateOne({ _id: item._id }, { $set: { image: comp } });
        console.log(`  ✅ Primary image optimized`);
      } else {
        console.log(`  ℹ️ Primary image already small`);
      }
    } else {
      console.log(`  ℹ️ Primary image is URL or empty`);
    }

    // 1b. Handle images array
    const docWithImages = await prodCol.findOne({ _id: item._id }, { projection: { images: 1 } });
    if (docWithImages && Array.isArray(docWithImages.images) && docWithImages.images.length > 0) {
      let changed = false;
      const newImages = [];
      for (let j = 0; j < docWithImages.images.length; j++) {
        const img = docWithImages.images[j];
        if (img && img.startsWith('data:image')) {
          const comp = await compressDataUri(img, 800, 80);
          newImages.push(comp);
          if (comp.length !== img.length) changed = true;
        } else {
          newImages.push(img);
        }
      }
      if (changed) {
        await prodCol.updateOne({ _id: item._id }, { $set: { images: newImages } });
        console.log(`  ✅ Images gallery optimized (${newImages.length} images)`);
      } else {
        console.log(`  ℹ️ Images gallery already optimized`);
      }
    }
  }

  // 2. CATEGORIES
  console.log('\n--- Checking Categories ---');
  const categories = await catCol.find({}, { projection: { _id: 1, name: 1 } }).toArray();
  console.log(`Found ${categories.length} categories to evaluate.`);

  for (let i = 0; i < categories.length; i++) {
    const item = categories[i];
    console.log(`[${i + 1}/${categories.length}] Processing category: "${item.name}" (${item._id})`);
    const catDoc = await catCol.findOne({ _id: item._id }, { projection: { image: 1 } });
    if (catDoc && catDoc.image && catDoc.image.startsWith('data:image')) {
      const origLen = catDoc.image.length;
      const comp = await compressDataUri(catDoc.image, 600, 80);
      if (comp.length !== origLen) {
        await catCol.updateOne({ _id: item._id }, { $set: { image: comp } });
        console.log(`  ✅ Category image optimized`);
      } else {
        console.log(`  ℹ️ Category image already small`);
      }
    } else {
      console.log(`  ℹ️ Category image is URL`);
    }
  }

  console.log('\n🎉 ALL DONE! All images are now highly optimized.');
  process.exit(0);
}

run().catch(err => {
  console.error('Fatal error during optimization:', err);
  process.exit(1);
});
