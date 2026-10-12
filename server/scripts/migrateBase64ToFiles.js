const path = require('path');
const fs = require('fs');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const mongoose = require('mongoose');
const connectDB = require('../config/db');

const uploadsDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Also ensure client/public/uploads exists so both direct frontend and backend proxy can serve it
const clientUploadsDir = path.join(__dirname, '..', '..', 'client', 'public', 'uploads');
if (!fs.existsSync(clientUploadsDir)) {
  fs.mkdirSync(clientUploadsDir, { recursive: true });
}

function saveBase64ToFile(dataUri, filename) {
  if (!dataUri || !dataUri.startsWith('data:image')) return dataUri;
  const commaIdx = dataUri.indexOf(',');
  if (commaIdx === -1) return dataUri;

  const base64Data = dataUri.substring(commaIdx + 1);
  const buffer = Buffer.from(base64Data, 'base64');

  const destPath = path.join(uploadsDir, filename);
  fs.writeFileSync(destPath, buffer);

  // Copy to client/public/uploads
  const clientDestPath = path.join(clientUploadsDir, filename);
  fs.writeFileSync(clientDestPath, buffer);

  console.log(`    💾 Saved ${filename} (${(buffer.length / 1024).toFixed(1)} KB)`);
  return `/uploads/${filename}`;
}

async function migrate() {
  console.log('Connecting to MongoDB Atlas...');
  await connectDB();
  const db = mongoose.connection.db;
  const prodCol = db.collection('products');
  const catCol = db.collection('categories');

  console.log('\n--- Migrating Products Base64 to Files ---');
  const products = await prodCol.find({}).toArray();
  for (const p of products) {
    let changed = false;
    let newImage = p.image;
    let newImages = p.images ? [...p.images] : [];

    if (p.image && p.image.startsWith('data:image')) {
      const filename = `product-${p._id}-thumb.jpg`;
      newImage = saveBase64ToFile(p.image, filename);
      changed = true;
    }

    if (Array.isArray(p.images)) {
      for (let j = 0; j < p.images.length; j++) {
        if (p.images[j] && p.images[j].startsWith('data:image')) {
          const filename = `product-${p._id}-${j}.jpg`;
          newImages[j] = saveBase64ToFile(p.images[j], filename);
          changed = true;
        }
      }
    }

    if (changed) {
      await prodCol.updateOne(
        { _id: p._id },
        { $set: { image: newImage, images: newImages } }
      );
      console.log(`  ✅ Updated product in MongoDB: "${p.name}"`);
    } else {
      console.log(`  ℹ️ Product "${p.name}" already uses file URL or external URL.`);
    }
  }

  console.log('\n--- Migrating Categories Base64 to Files ---');
  const categories = await catCol.find({}).toArray();
  for (const c of categories) {
    if (c.image && c.image.startsWith('data:image')) {
      const filename = `category-${c._id}.jpg`;
      const fileUrl = saveBase64ToFile(c.image, filename);
      await catCol.updateOne({ _id: c._id }, { $set: { image: fileUrl } });
      console.log(`  ✅ Updated category in MongoDB: "${c.name}" -> ${fileUrl}`);
    } else {
      console.log(`  ℹ️ Category "${c.name}" already uses file/external URL.`);
    }
  }

  console.log('\n🎉 ALL BASE64 DATA HAS BEEN EXTRACTED TO CLEAN STATIC FILES!');
  process.exit(0);
}

migrate().catch(err => {
  console.error('Migration failed:', err);
  process.exit(1);
});
