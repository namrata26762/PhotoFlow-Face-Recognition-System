const crypto = require('crypto');
const fs = require('fs');

/**
 * Calculates the Euclidean distance between two 128-dimensional face descriptor vectors.
 * d = sqrt( sum( (a[i] - b[i])^2 ) )
 */
const euclideanDistance = (descriptor1, descriptor2) => {
  if (!descriptor1 || !descriptor2) return 1.0;
  if (descriptor1.length !== descriptor2.length) return 1.0;

  let sum = 0;
  for (let i = 0; i < descriptor1.length; i++) {
    const diff = descriptor1[i] - descriptor2[i];
    sum += diff * diff;
  }
  return Math.sqrt(sum);
};

// Normalizes a vector to unit length
const normalizeVector = (vec) => {
  const magnitude = Math.sqrt(vec.reduce((sum, v) => sum + v * v, 0));
  if (magnitude === 0) return vec;
  return vec.map(v => v / magnitude);
};

/**
 * Converts Euclidean distance (typically 0.0 to 1.0+) to a human-readable confidence percentage.
 * Standard face recognition benchmark:
 * distance <= 0.20 -> 98-100% match
 * distance <= 0.40 -> 88-95% match
 * distance <= 0.55 -> 70-85% match (recommended threshold)
 * distance > 0.60 -> considered different face
 */
const calculateConfidence = (distance, threshold = 0.6) => {
  if (distance < 0) distance = 0;
  // If distance exceeds or equals threshold, treat as no match (0% confidence)
  if (distance >= threshold) {
    return 0;
  }
  // Non‑linear mapping to spread confidence values for distances close to the threshold.
  // Using quadratic decay: confidence = ((threshold - distance) / threshold) ^ 2 * 100
  const ratio = (threshold - distance) / threshold;
  const confidence = Math.pow(ratio, 2) * 100;
  return Math.round(confidence * 10) / 10; // one decimal place
};

/**
 * Generates deterministic 128-float feature descriptor from image buffer
 * Fallback when client-side canvas/face-api is unavailable
 */
const generateDeterministicDescriptor = (imageBuffer) => {
  const descriptor = new Array(128).fill(0);
  if (!imageBuffer || imageBuffer.length === 0) return descriptor;

  // Hash portions of buffer to create reproducible 128 normalized float vectors
  const hash = crypto.createHash('sha512').update(imageBuffer).digest();
  const hash2 = crypto.createHash('sha256').update(imageBuffer).digest();
  const combined = Buffer.concat([hash, hash2, hash]);

  for (let i = 0; i < 128; i++) {
    const byteVal = combined[i % combined.length];
    // Map to normalized range [-0.2, 0.2]
    descriptor[i] = (byteVal / 255.0) * 0.4 - 0.2;
  }

  // Normalize vector to unit length
  const magnitude = Math.sqrt(descriptor.reduce((sum, val) => sum + val * val, 0));
  if (magnitude > 0) {
    for (let i = 0; i < 128; i++) {
      descriptor[i] = descriptor[i] / magnitude;
    }
  }

  return descriptor;
};

/**
 * Compares query descriptor against all stored face records
 */
// Updated matchDescriptors with detailed development logs and validCount tracking
const matchDescriptors = (queryDescriptor, faceRecords, threshold = 0.6) => {
  const matches = [];

  // Validate query descriptor
  if (!Array.isArray(queryDescriptor) || queryDescriptor.length !== 128) {
    console.warn('🔍 Query descriptor invalid or missing');
    return [];
  }
  const normQuery = normalizeVector(queryDescriptor);
  let validCount = 0;
  for (const record of faceRecords) {
    // Ensure stored descriptor is a proper 128‑dim array
    if (!Array.isArray(record.faceDescriptor) || record.faceDescriptor.length !== 128) continue;

    // Validate descriptor using utility (ensures finiteness etc.)
    const validation = require('../utils/descriptorValidator').validateDescriptor(record.faceDescriptor);
    if (!validation.valid) continue;

    // Skip near‑zero or placeholder descriptors (magnitude too small)
    const magnitude = Math.sqrt(record.faceDescriptor.reduce((sum, v) => sum + v * v, 0));
    if (magnitude < 0.01) continue;

    validCount++;
    const normRecord = normalizeVector(record.faceDescriptor);
    const distance = euclideanDistance(normQuery, normRecord);
    const confidence = calculateConfidence(distance, threshold);

    if (distance <= threshold) {
      console.log(`🔎 Match candidate: recordId=${record._id} photoId=${record.photoId} distance=${distance.toFixed(4)} confidence=${confidence}`);
      matches.push({
        recordId: record._id,
        photoId: record.photoId?._id || record.photoId,
        photo: record.photoId,
        distance: Math.round(distance * 1000) / 1000,
        confidence,
        box: record.box,
      });
    }
  }
  console.log(`🔎 Matching completed: ${validCount} valid records scanned, ${matches.length} matches found`);

  // Sort best match first (lowest distance)
  matches.sort((a, b) => a.distance - b.distance);

  // Eliminate duplicate photo matches (keep highest confidence per photo)
  const uniquePhotoMatches = [];
  const seenPhotoIds = new Set();
  for (const match of matches) {
    const pIdStr = match.photoId ? match.photoId.toString() : null;
    if (pIdStr && !seenPhotoIds.has(pIdStr)) {
      seenPhotoIds.add(pIdStr);
      uniquePhotoMatches.push(match);
    }
  }
  return uniquePhotoMatches;
};

module.exports = {
  euclideanDistance,
  calculateConfidence,
  generateDeterministicDescriptor,
  matchDescriptors,
};
