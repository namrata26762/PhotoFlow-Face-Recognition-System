// Backend/services/faceIndexingService.js
// Service to automatically index gallery photos with genuine Face‑API descriptors.
// It scans photos with indexStatus = 'pending' (or optionally all photos), detects faces,
// creates FaceRecord entries, updates indexStatus, and logs progress.

const path = require('path');
const fs = require('fs');
const mongoose = require('mongoose');
const canvas = require('canvas');
const faceapi = require('@vladmandic/face-api');
const Photo = require('../models/Photo');
const FaceRecord = require('../models/FaceRecord');
const { validateDescriptor } = require('../utils/descriptorValidator');

// Helper: verify required Face‑API model files exist
function checkModelFiles(modelDir) {
  const required = [
    'ssdMobilenetv1_model-weights_manifest.json',
    'face_landmark_68_model-weights_manifest.json',
    'face_recognition_model-weights_manifest.json',
  ];
  const missing = required.filter(f => !fs.existsSync(path.join(modelDir, f)));
  return missing;
}

// Load models once (cached)
let modelsLoaded = false;
async function loadModels() {
  if (modelsLoaded) return;
  const modelPath = path.join(__dirname, '..', 'models', 'faceapi');
  const missing = checkModelFiles(modelPath);
  if (missing.length) {
    console.error('❌ Missing Face‑API model files:', missing);
    throw new Error('Face‑API models not found. Required files: ' + missing.join(', '));
  }
  await faceapi.nets.ssdMobilenetv1.loadFromDisk(modelPath);
  await faceapi.nets.faceLandmark68Net.loadFromDisk(modelPath);
  await faceapi.nets.faceRecognitionNet.loadFromDisk(modelPath);
  modelsLoaded = true;
  console.log('✅ Face‑API models loaded');
}

/**
 * Index a single photo.
 * Updates photo.indexStatus according to outcome.
 * Returns an object {photoId, status, reason?}
 */
async function indexPhoto(photo) {
  try {
    await loadModels();
    // Mark as processing
    await Photo.findByIdAndUpdate(photo._id, { indexStatus: 'processing' });
    const filePath = path.join(__dirname, '..', 'uploads', path.basename(photo.imageUrl));
    if (!fs.existsSync(filePath)) {
      await Photo.findByIdAndUpdate(photo._id, { indexStatus: 'failed' });
      return { photoId: photo._id, status: 'failed', reason: 'Image file missing' };
    }
    const img = await canvas.loadImage(filePath);
    const detection = await faceapi.detectSingleFace(img).withFaceLandmarks().withFaceDescriptor();
    if (!detection) {
      await Photo.findByIdAndUpdate(photo._id, { indexStatus: 'no-face' });
      return { photoId: photo._id, status: 'no-face' };
    }
    const descriptor = Array.from(detection.descriptor);
    const validation = validateDescriptor(descriptor);
    if (!validation.valid) {
      await Photo.findByIdAndUpdate(photo._id, { indexStatus: 'failed' });
      return { photoId: photo._id, status: 'failed', reason: validation.error };
    }
    // Replace any existing record for safety
    await FaceRecord.findOneAndDelete({ photoId: photo._id });
    await FaceRecord.create({
      photoId: photo._id,
      userId: photo.userId,
      faceDescriptor: descriptor,
      box: detection.detection.box,
      confidence: detection.detection.score || 0.95,
    });
    await Photo.findByIdAndUpdate(photo._id, { indexStatus: 'indexed', facesDetected: 1 });
    return { photoId: photo._id, status: 'indexed' };
  } catch (err) {
    console.error(`⚠️ Indexing error for photo ${photo._id}:`, err);
    await Photo.findByIdAndUpdate(photo._id, { indexStatus: 'failed' });
    return { photoId: photo._id, status: 'failed', reason: err.message };
  }
}

/**
 * Scan and index all pending photos for a given user (or all users if userId omitted).
 * Returns a summary object.
 */
async function indexAllPending(userId = null) {
  const query = { indexStatus: { $in: ['pending', 'failed'] } };
  if (userId) query.userId = userId;
  const photos = await Photo.find(query);
  console.log(`🔎 Starting indexing for ${photos.length} photo(s)${userId ? ' (user filter)' : ''}`);
  const results = [];
  for (const p of photos) {
    results.push(await indexPhoto(p));
  }
  const summary = {
    total: photos.length,
    indexed: results.filter(r => r.status === 'indexed').length,
    noFace: results.filter(r => r.status === 'no-face').length,
    failed: results.filter(r => r.status === 'failed').length,
  };
  console.log('📊 Indexing summary:', summary);
  return summary;
}

module.exports = { indexPhoto, indexAllPending };
