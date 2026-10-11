// Backend/scripts/cleanDeterministicFaceRecords.js

/**
 * Clean up FaceRecord documents that contain deterministic (hash‑based) descriptors.
 * This script deletes only the FaceRecord entries; original Photo documents remain untouched.
 * Run with: `node scripts/cleanDeterministicFaceRecords.js` from the Backend directory.
 */

require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const mongoose = require('mongoose');
const FaceRecord = require('../models/FaceRecord');

// Deterministic descriptors are limited to the range [-0.2, 0.2] (see generateDeterministicDescriptor).
function isDeterministic(descriptor) {
  if (!Array.isArray(descriptor) || descriptor.length !== 128) return false;
  for (const v of descriptor) {
    if (v < -0.2 || v > 0.2) return false;
  }
  return true;
}

(async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/photoflow', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Connected to MongoDB');

    const total = await FaceRecord.countDocuments();
    console.log(`📦 Total FaceRecord documents before clean: ${total}`);

    const cursor = FaceRecord.find().cursor();
    let removed = 0;
    for await (const rec of cursor) {
      if (isDeterministic(rec.faceDescriptor)) {
        await FaceRecord.deleteOne({ _id: rec._id });
        removed++;
        console.log(`🗑️ Removed deterministic FaceRecord ${rec._id}`);
      }
    }

    const after = await FaceRecord.countDocuments();
    console.log(`✅ Clean‑up complete. Removed ${removed} records. Remaining records: ${after}`);
    process.exit(0);
  } catch (err) {
    console.error('❌ Error during clean‑up:', err);
    process.exit(1);
  }
})();
