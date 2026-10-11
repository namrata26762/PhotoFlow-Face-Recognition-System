/**
 * Validates that a face descriptor is an array of exactly 128 finite numbers.
 * Returns an object { valid: boolean, error?: string }.
 */
function validateDescriptor(descriptor) {
  if (!Array.isArray(descriptor)) {
    return { valid: false, error: 'Descriptor must be an array.' };
  }
  if (descriptor.length !== 128) {
    return { valid: false, error: 'Descriptor must contain exactly 128 values.' };
  }
  for (let i = 0; i < descriptor.length; i++) {
    const v = descriptor[i];
    if (typeof v !== 'number' || !Number.isFinite(v)) {
      return { valid: false, error: `Descriptor contains non-finite number at index ${i}.` };
    }
  }
  return { valid: true };
}

module.exports = { validateDescriptor };
