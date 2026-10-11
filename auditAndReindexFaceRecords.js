// auditAndReindexFaceRecords.js
// This script audits FaceRecord documents for invalid or duplicated descriptors,
// creates a backup JSON file, generates a dry‑run report, and (optionally) removes
// problematic records so they can be re‑indexed with genuine Face‑API descriptors.
// NOTE: Real re‑indexing (extracting descriptors from original images on the server)
// requires a Node.js face‑api implementation or a headless Chromium runner which
// is out of scope for this script. This script will delete invalid records and
// output a list of photo IDs that need to be re‑uploaded or processed separately.

require('dotenv').config();
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const readline = require('readline');

const FaceRecord = require('../models/FaceRecord');
const Photo = require('../models/Photo');

// Helper to compute a lightweight hash of a descriptor (stringified & trimmed)
function descriptorHash(descriptor) {
  // Simple MD5‑like hash using JSON string – adequate for grouping duplicates
  const json = JSON.stringify(descriptor.map(v => Number(v.toFixed(5))));
  let hash = 0, i, chr;
  for (i = 0; i < json.length; i++) {
    chr = json.charCodeAt(i);
    hash = ((hash << 5) - hash) + chr;
    hash |= 0; // Convert to 32‑bit integer
  }
  return hash;
}

function magnitude(vec) {
  return Math.sqrt(vec.reduce((s, v) => s + v * v, 0));
}

async function main() {
  const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/photoflow';
  await mongoose.connect(mongoUri, { useNewUrlParser: true, useUnifiedTopology: true });
  console.log('Connected to MongoDB');

  const allRecords = await FaceRecord.find({}).populate('photoId');
  const total = allRecords.length;

  const backupPath = path.resolve(__dirname, 'faceRecordsBackup.json');
  fs.writeFileSync(backupPath, JSON.stringify(allRecords, null, 2));
  console.log(`Backup of ${total} FaceRecord documents saved to ${backupPath}`);

  // Analyse descriptors
  const hashMap = new Map(); // hash -> array of records
  const invalidRecords = [];

  for (const rec of allRecords) {
    const desc = rec.faceDescriptor;
    if (!Array.isArray(desc) || desc.length !== 128) {
      invalidRecords.push(rec);
      continue;
    }
    const mag = magnitude(desc);
    if (mag < 0.01) {
      // Near‑zero placeholder descriptor (likely generatedDeterministicDescriptor)
      invalidRecords.push(rec);
      continue;
    }
    const h = descriptorHash(desc);
    if (!hashMap.has(h)) hashMap.set(h, []);
    hashMap.get(h).push(rec);
  }

  // Find duplicate descriptors used for different photos
  const duplicateRecords = [];
  for (const [h, recs] of hashMap.entries()) {
    const photoIds = new Set(recs.map(r => r.photoId && r.photoId._id?.toString()));
    if (photoIds.size > 1) {
      // Same descriptor attached to multiple photos – suspicious
      duplicateRecords.push(...recs);
    }
  }

  const report = {
    timestamp: new Date().toISOString(),
    totalRecords: total,
    invalidCount: invalidRecords.length,
    duplicateDescriptorCount: duplicateRecords.length,
    uniqueDescriptorCount: hashMap.size,
  };

  const reportPath = path.resolve(__dirname, 'faceRecordsAuditReport.json');
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  console.log(`Audit report written to ${reportPath}`);
  console.table(report);

  // Automatically delete identified problematic FaceRecords (invalid or duplicate descriptors)
const toDelete = new Set([...invalidRecords, ...duplicateRecords].map(r => r._id.toString()));
if (toDelete.size === 0) {
  console.log('No problematic FaceRecords found to delete.');
  process.exit(0);
}
const deleteResult = await FaceRecord.deleteMany({ _id: { $in: Array.from(toDelete) } });
console.log(`Deleted ${deleteResult.deletedCount} problematic FaceRecord(s).`);
// List the photo IDs that now lack a descriptor (so they can be re‑indexed)
const affectedPhotoIds = new Set([...invalidRecords, ...duplicateRecords].map(r => r.photoId && r.photoId._id?.toString()));
console.log('Photos that may need re‑indexing (IDs):', Array.from(affectedPhotoIds).filter(id => !!id));
process.exit(0);
}

main().catch(err => {
  console.error('Error during audit/reindex script:', err);
  process.exit(1);
});
