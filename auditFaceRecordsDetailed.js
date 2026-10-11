// auditFaceRecordsDetailed.js
// Purpose: Diagnose duplicate or corrupted FaceRecords for all users.

const mongoose = require('mongoose');
const uri = 'mongodb://localhost:27017/photoflow';

const faceRecordSchema = new mongoose.Schema({
  photoId: { type: mongoose.Schema.Types.ObjectId, ref: 'Photo' },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  faceDescriptor: { type: [Number] },
}, { collection: 'facerecords' });

const FaceRecord = mongoose.model('FaceRecord', faceRecordSchema);

(async () => {
  try {
    await mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
    const total = await FaceRecord.countDocuments();
    console.log('Total FaceRecords in DB:', total);

    const records = await FaceRecord.find().lean();
    // Group by descriptor fingerprint (hash of first 5 numbers) to detect identical vectors.
    const descMap = {};
    records.forEach(rec => {
      const key = (rec.faceDescriptor && rec.faceDescriptor.slice(0,5).join(',')) || 'null';
      if (!descMap[key]) descMap[key] = [];
      descMap[key].push(rec);
    });

    // Report per user
    const users = {};
    records.forEach(rec => {
      const uid = rec.userId?.toString() || 'unknown';
      if (!users[uid]) users[uid] = [];
      users[uid].push(rec);
    });

    for (const [uid, recs] of Object.entries(users)) {
      console.log(`\nUser ${uid} has ${recs.length} FaceRecords`);
      // Breakdown by photo
      const byPhoto = {};
      recs.forEach(r => {
        const pid = r.photoId?.toString() || 'null';
        if (!byPhoto[pid]) byPhoto[pid] = [];
        byPhoto[pid].push(r);
      });
      for (const [pid, list] of Object.entries(byPhoto)) {
        console.log(`  Photo ${pid} -> ${list.length} FaceRecord(s)`);
        // Check if any descriptor identical to other photos
        const dup = list.some(r => {
          const key = (r.faceDescriptor && r.faceDescriptor.slice(0,5).join(',')) || '';
          const matches = descMap[key] || [];
          // Count distinct photoIds sharing this key
          const distinctPhotos = new Set(matches.map(m => m.photoId?.toString() || 'null'));
          return distinctPhotos.size > 1; // same descriptor appears elsewhere
        });
        if (dup) {
          console.log('    ⚠️ Potential duplicate descriptor across photos');
        }
      }
    }
    await mongoose.disconnect();
  } catch (err) {
    console.error('Audit error:', err);
  }
})();
