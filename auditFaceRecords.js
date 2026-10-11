// auditFaceRecords.js
// SAFE audit of FaceRecord collection – counts, validates descriptors, checks photo linkage.
// Does NOT modify any data.

require('dotenv').config();
const mongoose = require('mongoose');
const FaceRecord = require('../models/FaceRecord');
const Photo = require('../models/Photo');

const THRESHOLD_MAGNITUDE = 0.1; // descriptors near zero are suspicious
const DETERMINISTIC_RANGE = 0.2; // deterministic descriptors are within [-0.2, 0.2]

async function main() {
  const uri = process.env.MONGO_URI || 'mongodb://localhost:27017/photoflow';
  await mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
  console.log('✅ Connected to MongoDB');

  const total = await FaceRecord.countDocuments();
  console.log('Total FaceRecord documents:', total);

  const records = await FaceRecord.find({}).populate('photoId', 'userId imageUrl title');

  let valid = 0, missingPhoto = 0, suspicious = 0, needReprocess = 0;

  for (const rec of records) {
    const descriptor = rec.faceDescriptor;
    const isArray = Array.isArray(descriptor) && descriptor.length === 128;
    const allFinite = isArray && descriptor.every(v => typeof v === 'number' && Number.isFinite(v));
    const magnitude = isArray ? Math.sqrt(descriptor.reduce((s, v) => s + v * v, 0)) : 0;
    const withinDeterministic = isArray && descriptor.every(v => v >= -DETERMINISTIC_RANGE && v <= DETERMINISTIC_RANGE);

    const photoExists = !!rec.photoId;
    const correctUser = photoExists && String(rec.userId) === String(rec.photoId.userId);

    const looksValid = isArray && allFinite && magnitude > THRESHOLD_MAGNITUDE && !withinDeterministic && correctUser;
    if (!photoExists) {
      missingPhoto++;
    } else if (!looksValid) {
      suspicious++;
      // If descriptor is not deterministic but magnitude is far from 1, still consider reprocess.
      if (isArray && allFinite && Math.abs(magnitude - 1) > 0.2) {
        needReprocess++;
      }
    } else {
      valid++;
    }
  }

  console.log('\n--- Audit Summary ---');
  console.log('Valid records (genuine descriptors, linked photo, correct user):', valid);
  console.log('Records with missing photo reference:', missingPhoto);
  console.log('Suspicious records (possible deterministic or bad magnitude):', suspicious);
  console.log('Of suspicious, likely need re‑processing:', needReprocess);

  await mongoose.disconnect();
  console.log('✅ Disconnected');
}

main().catch(err => {
  console.error('Audit error:', err);
  process.exit(1);
});
