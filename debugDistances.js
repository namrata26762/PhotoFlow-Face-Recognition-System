// debugDistances.js
// Simple script to load two FaceRecord descriptors for the same user and compute Euclidean distance after normalization.
require('dotenv').config();
const mongoose = require('mongoose');
const FaceRecord = require('../models/FaceRecord');

(async () => {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/photoflow';
  await mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
  console.log('Connected to DB');
  const userId = process.argv[2]; // pass userId as arg
  if (!userId) { console.error('Provide userId'); process.exit(1); }
  const records = await FaceRecord.find({ userId }).limit(10);
  console.log(`Found ${records.length} records for user ${userId}`);
  if (records.length < 2) { console.log('Not enough records'); process.exit(0); }
  const normalize = (vec) => {
    const mag = Math.sqrt(vec.reduce((s, v) => s + v * v, 0));
    return vec.map(v => v / mag);
  };
  const euclidean = (a, b) => {
    let sum = 0;
    for (let i = 0; i < a.length; i++) { const d = a[i] - b[i]; sum += d * d; }
    return Math.sqrt(sum);
  };
  const d1 = normalize(records[0].faceDescriptor);
  const d2 = normalize(records[1].faceDescriptor);
  const dist = euclidean(d1, d2);
  console.log('Distance between first two records:', dist);
  // Show threshold test
  const threshold = 0.45;
  console.log('Within threshold?', dist <= threshold);
  process.exit(0);
})();
