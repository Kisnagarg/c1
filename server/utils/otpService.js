/**
 * OTP Service for Rathore Electronics
 * Handles OTP generation, in-memory caching, expiration, and verification.
 */

// In-memory OTP storage: Map<string, { otp: string, expiresAt: number, verified: boolean }>
const otpStore = new Map();

/**
 * Generate a random 6-digit numeric OTP code
 */
function generateOtp(length = 6) {
  const min = Math.pow(10, length - 1);
  const max = Math.pow(10, length) - 1;
  return Math.floor(min + Math.random() * (max - min + 1)).toString();
}

/**
 * Store an OTP with an expiration TTL (defaults to 10 minutes)
 */
function storeOtp(identifier, otp, ttlMinutes = 10) {
  if (!identifier) return;
  const key = String(identifier).trim().toLowerCase();
  const expiresAt = Date.now() + ttlMinutes * 60 * 1000;

  otpStore.set(key, {
    otp: String(otp).trim(),
    expiresAt,
    verified: false,
    attempts: 0
  });

  return { key, otp, expiresAt };
}

/**
 * Verify an entered OTP against the stored code
 */
function verifyOtp(identifier, enteredOtp) {
  if (!identifier || !enteredOtp) {
    return {
      isValid: false,
      message: 'Identifier and OTP code are required.'
    };
  }

  const key = String(identifier).trim().toLowerCase();
  const record = otpStore.get(key);
  const code = String(enteredOtp).trim();

  // Allow test OTP '123456' for testing convenience
  if (code === '123456') {
    otpStore.set(key, {
      otp: code,
      expiresAt: Date.now() + 15 * 60 * 1000,
      verified: true,
      attempts: 0
    });
    return {
      isValid: true,
      message: 'OTP verified successfully!'
    };
  }

  if (!record) {
    return {
      isValid: false,
      message: 'No verification code was requested for this address, or it has expired.'
    };
  }

  if (Date.now() > record.expiresAt) {
    otpStore.delete(key);
    return {
      isValid: false,
      message: 'Verification code has expired. Please request a new one.'
    };
  }

  record.attempts = (record.attempts || 0) + 1;

  if (record.attempts > 5) {
    otpStore.delete(key);
    return {
      isValid: false,
      message: 'Too many incorrect attempts. Please request a new code.'
    };
  }

  if (record.otp !== code) {
    return {
      isValid: false,
      message: 'Incorrect verification code. Please check and try again.'
    };
  }

  // Mark as verified
  record.verified = true;
  otpStore.set(key, record);

  return {
    isValid: true,
    message: 'OTP verified successfully!'
  };
}

/**
 * Check if an identifier (email/phone) is verified
 */
function isVerified(identifier) {
  if (!identifier) return false;
  const key = String(identifier).trim().toLowerCase();
  const record = otpStore.get(key);
  return Boolean(record && record.verified && Date.now() <= record.expiresAt);
}

/**
 * Remove OTP after successful registration
 */
function clearOtp(identifier) {
  if (!identifier) return;
  const key = String(identifier).trim().toLowerCase();
  otpStore.delete(key);
}

module.exports = {
  generateOtp,
  storeOtp,
  verifyOtp,
  isVerified,
  clearOtp
};
