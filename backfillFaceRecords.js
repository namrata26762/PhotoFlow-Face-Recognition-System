// Backfill FaceRecord entries for photos that lack a descriptor
// Run with: node backend/scripts/backfillFaceRecords.js

require('dotenv').config(); // if .env is used for DB connection
const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');

const Photo = require('../models/Photo');
const FaceRecord = require('../models/FaceRecord');
const { generateDeterministicDescriptor } = require('../services/faceRecognitionService');

// Adjust your MongoDB URI as needed (environment variable or hard‑code)
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/photoflow';

(async () => {
  try {
    await mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
    console.log('✅ Connected to MongoDB');

    const photos = await Photo.find({});
    console.log(`📸 Found ${photos.length} photos in the database`);

    let created = 0;
    for (const photo of photos) {
      const existing = await FaceRecord.findOne({ photoId: photo._id });
      if (existing) continue; // already has descriptor

      // Build absolute file path to the uploaded image
      const filePath = path.join(__dirname, '..', 'uploads', path.basename(photo.imageUrl));
      if (!fs.existsSync(filePath)) {
        console.warn(`⚠️ Image file missing for photo ${photo._id}: ${filePath}`);
        continue;
      }
      // Skip backfill for this photo because it lacks a valid descriptor.
// The front‑end upload flow will generate a genuine descriptor when the user re‑uploads.
console.log(`⚠️ Photo ${photo._id} has no FaceRecord. Please re‑upload to generate a real descriptor.`);
continue;
    }

    console.log(`🏁 Backfill complete. ${created} new FaceRecord(s) created.`);
    process.exit(0);
  } catch (err) {
    console.error('❌ Error during backfill:', err);
    process.exit(1);
  }
})();
