import crypto from 'crypto';

// In-memory store for OTPs (in production, use Redis or database)
const otpStore = new Map();
const rateLimitStore = new Map();
const verificationAttempts = new Map();

// Configuration
const OTP_LENGTH = 6;
const OTP_EXPIRY_MINUTES = 10;
const MAX_OTP_REQUESTS_PER_HOUR = 3;
const MAX_OTP_REQUESTS_PER_DAY = 5;
const VERIFICATION_COOLDOWN_MINUTES = 2;
const MAX_VERIFICATION_ATTEMPTS = 3;
const LOCKOUT_DURATION_MINUTES = 30;
const DEVELOPMENT_MODE = process.env.NODE_ENV !== 'production'; // Allow bypass in development

/**
 * Generate a random OTP
 */
function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

/**
 * Send OTP via SMS (mock implementation - can be replaced with real SMS service)
 * Free alternatives:
 * - Twilio (free trial)
 * - MSG91 (free tier)
 * - TextLocal (free tier)
 * - For development: console.log
 */
async function sendSMS(phoneNumber, message) {
  // DEVELOPMENT MODE: Just log to console
  console.log('\n========================================');
  console.log('📱 SMS SERVICE (DEVELOPMENT MODE)');
  console.log('========================================');
  console.log(`To: ${phoneNumber}`);
  console.log(`Message: ${message}`);
  console.log('========================================\n');
  
  // TODO: Replace with real SMS service in production
  // Example with Twilio:
  /*
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const client = require('twilio')(accountSid, authToken);
  
  await client.messages.create({
    body: message,
    from: process.env.TWILIO_PHONE_NUMBER,
    to: phoneNumber
  });
  */
  
  return true;
}

/**
 * Generate and send OTP to phone number
 */
export async function sendOTP(phoneNumber, purpose = 'verification') {
  try {
    // Validate phone number format
    if (!isValidPhoneNumber(phoneNumber)) {
      throw new Error('Invalid phone number format. Please use international format (e.g., +1234567890)');
    }
    
    // Check rate limits
    const rateLimitCheck = checkRateLimit(phoneNumber);
    if (!rateLimitCheck.allowed) {
      throw new Error(rateLimitCheck.reason);
    }
    
    // Generate OTP with cryptographic randomness for better security
    const otp = crypto.randomInt(100000, 999999).toString();
    const expiresAt = Date.now() + (OTP_EXPIRY_MINUTES * 60 * 1000);
    
    // Record this OTP request
    recordOTPRequest(phoneNumber);
    
    // Store OTP with additional security metadata
    otpStore.set(phoneNumber, {
      otp,
      expiresAt,
      purpose,
      attempts: 0,
      createdAt: Date.now(),
      ipAddress: null, // Can be set from request
      verified: false
    });
    
    // Send SMS
    const message = `Your TravelBuddy verification code is: ${otp}. Valid for ${OTP_EXPIRY_MINUTES} minutes. Do not share this code with anyone.`;
    await sendSMS(phoneNumber, message);
    
    console.log(`✅ OTP sent to ${phoneNumber} (masked: ${phoneNumber.slice(0, -4).replace(/\d/g, '*')}${phoneNumber.slice(-4)})`);
    
    return {
      success: true,
      message: 'OTP sent successfully',
      expiresIn: OTP_EXPIRY_MINUTES * 60, // in seconds
      maskedPhone: phoneNumber.slice(0, -4).replace(/\d/g, '*') + phoneNumber.slice(-4)
    };
  } catch (error) {
    console.error('Error sending OTP:', error);
    throw error;
  }
}

/**
 * Verify OTP for a phone number
 */
export function verifyOTP(phoneNumber, otp) {
  // Input validation
  if (!otp || typeof otp !== 'string' || !/^\d{6}$/.test(otp)) {
    return {
      success: false,
      message: 'Invalid OTP format. Please enter a 6-digit code.'
    };
  }

  // DEVELOPMENT MODE: Accept any 6-digit number if no OTP was sent
  if (DEVELOPMENT_MODE) {
    const stored = otpStore.get(phoneNumber);
    if (!stored) {
      console.log(`🔓 DEV MODE: Accepting OTP ${otp} for ${phoneNumber.slice(0, -4).replace(/\d/g, '*')}${phoneNumber.slice(-4)}`);
      return {
        success: true,
        message: 'Phone number verified successfully (Development Mode)',
        verifiedAt: new Date().toISOString(),
        developmentMode: true
      };
    }
  }
  
  const stored = otpStore.get(phoneNumber);
  
  if (!stored) {
    return {
      success: false,
      message: 'No OTP found. Please request a new one.'
    };
  }
  
  // Check if already verified
  if (stored.verified) {
    return {
      success: false,
      message: 'This OTP has already been used. Please request a new one.'
    };
  }
  
  // Check expiry
  if (Date.now() > stored.expiresAt) {
    otpStore.delete(phoneNumber);
    verificationAttempts.delete(phoneNumber);
    return {
      success: false,
      message: 'OTP has expired. Please request a new one.'
    };
  }
  
  // Check attempts (max 3)
  if (stored.attempts >= MAX_VERIFICATION_ATTEMPTS) {
    otpStore.delete(phoneNumber);
    const attemptCheck = checkVerificationAttempts(phoneNumber, false);
    return {
      success: false,
      message: attemptCheck.reason || 'Maximum verification attempts exceeded. Please request a new OTP.'
    };
  }
  
  // Verify OTP using timing-safe comparison to prevent timing attacks
  // First check if lengths match (timingSafeEqual requires same length)
  let isValid = false;
  if (stored.otp.length === otp.length) {
    try {
      isValid = crypto.timingSafeEqual(
        Buffer.from(stored.otp),
        Buffer.from(otp)
      );
    } catch (error) {
      // Fallback to regular comparison if timing-safe fails
      isValid = stored.otp === otp;
    }
  }
  
  if (!isValid) {
    stored.attempts++;
    const attemptsRemaining = MAX_VERIFICATION_ATTEMPTS - stored.attempts;
    
    // Update verification attempts tracking
    checkVerificationAttempts(phoneNumber, false);
    
    if (attemptsRemaining === 0) {
      otpStore.delete(phoneNumber);
      return {
        success: false,
        message: 'Maximum verification attempts exceeded. Please request a new OTP.'
      };
    }
    
    return {
      success: false,
      message: `Invalid OTP. ${attemptsRemaining} attempt${attemptsRemaining !== 1 ? 's' : ''} remaining.`
    };
  }
  
  // Success - immediately delete to prevent reuse
  otpStore.delete(phoneNumber);
  checkVerificationAttempts(phoneNumber, true);
  
  console.log(`✅ Phone verified successfully: ${phoneNumber.slice(0, -4).replace(/\d/g, '*')}${phoneNumber.slice(-4)}`);
  
  return {
    success: true,
    message: 'Phone number verified successfully',
    verifiedAt: new Date().toISOString()
  };
}

/**
 * Resend OTP (with rate limiting)
 */
export async function resendOTP(phoneNumber) {
  const stored = otpStore.get(phoneNumber);
  
  // Check if OTP was sent recently (prevent spam)
  if (stored && stored.createdAt && (Date.now() - stored.createdAt) < (VERIFICATION_COOLDOWN_MINUTES * 60 * 1000)) {
    const waitSeconds = Math.ceil((VERIFICATION_COOLDOWN_MINUTES * 60 * 1000 - (Date.now() - stored.createdAt)) / 1000);
    return {
      success: false,
      message: `Please wait ${waitSeconds} seconds before requesting a new OTP`
    };
  }
  
  // Clear old OTP before sending new one
  if (stored) {
    otpStore.delete(phoneNumber);
  }
  
  // Send new OTP
  return await sendOTP(phoneNumber);
}

/**
 * Clear OTP for a phone number
 */
export function clearOTP(phoneNumber) {
  otpStore.delete(phoneNumber);
}

/**
 * Format phone number to international format
 */
export function formatPhoneNumber(phone, countryCode = '+1') {
  // Remove all non-numeric characters
  const cleaned = phone.replace(/\D/g, '');
  
  // Add country code if not present
  if (!phone.startsWith('+')) {
    return `${countryCode}${cleaned}`;
  }
  
  return `+${cleaned}`;
}

/**
 * Validate phone number format
 */
export function isValidPhoneNumber(phone) {
  // Remove all non-numeric characters except +
  const cleaned = phone.replace(/[^0-9+]/g, '');
  
  // Must start with + for international format
  if (!cleaned.startsWith('+')) {
    return false;
  }
  
  // Extract digits only
  const digits = cleaned.replace(/\D/g, '');
  
  // Valid range: 10-15 digits
  if (digits.length < 10 || digits.length > 15) {
    return false;
  }
  
  // Check for valid country codes (basic check)
  const countryCode = digits.substring(0, 3);
  const validCountryCodes = ['1', '7', '20', '27', '30', '31', '32', '33', '34', '36', '39', '40', '41', '43', '44', '45', '46', '47', '48', '49', '51', '52', '53', '54', '55', '56', '57', '58', '60', '61', '62', '63', '64', '65', '66', '81', '82', '84', '86', '90', '91', '92', '93', '94', '95', '98', '212', '213', '216', '218', '220', '221', '222', '223', '224', '225', '226', '227', '228', '229', '230', '231', '232', '233', '234', '235', '236', '237', '238', '239', '240', '241', '242', '243', '244', '245', '246', '248', '249', '250', '251', '252', '253', '254', '255', '256', '257', '258', '260', '261', '262', '263', '264', '265', '266', '267', '268', '269', '290', '291', '297', '298', '299', '350', '351', '352', '353', '354', '355', '356', '357', '358', '359', '370', '371', '372', '373', '374', '375', '376', '377', '378', '380', '381', '382', '383', '385', '386', '387', '389', '420', '421', '423', '500', '501', '502', '503', '504', '505', '506', '507', '508', '509', '590', '591', '592', '593', '594', '595', '596', '597', '598', '599', '670', '672', '673', '674', '675', '676', '677', '678', '679', '680', '681', '682', '683', '685', '686', '687', '688', '689', '690', '691', '692', '850', '852', '853', '855', '856', '880', '886', '960', '961', '962', '963', '964', '965', '966', '967', '968', '970', '971', '972', '973', '974', '975', '976', '977', '992', '993', '994', '995', '996', '998'];
  
  // Check if starts with valid country code
  let hasValidCode = false;
  for (const code of validCountryCodes) {
    if (digits.startsWith(code)) {
      hasValidCode = true;
      break;
    }
  }
  
  if (!hasValidCode) {
    return false;
  }
  
  // Additional checks for suspicious patterns
  // Reject if all digits are the same
  if (/^(\d)\1+$/.test(digits)) {
    return false;
  }
  
  // Reject sequential numbers (e.g., 123456789)
  let isSequential = true;
  for (let i = 1; i < digits.length; i++) {
    if (parseInt(digits[i]) !== parseInt(digits[i-1]) + 1) {
      isSequential = false;
      break;
    }
  }
  if (isSequential) {
    return false;
  }
  
  return true;
}

/**
 * Check rate limit for phone number
 */
function checkRateLimit(phoneNumber) {
  const now = Date.now();
  const phoneData = rateLimitStore.get(phoneNumber) || { requests: [], lastRequest: 0 };
  
  // Clean old requests (older than 24 hours)
  phoneData.requests = phoneData.requests.filter(timestamp => now - timestamp < 24 * 60 * 60 * 1000);
  
  // Check if in cooldown period
  if (phoneData.lastRequest && (now - phoneData.lastRequest) < (VERIFICATION_COOLDOWN_MINUTES * 60 * 1000)) {
    const waitSeconds = Math.ceil((VERIFICATION_COOLDOWN_MINUTES * 60 * 1000 - (now - phoneData.lastRequest)) / 1000);
    return {
      allowed: false,
      reason: `Please wait ${waitSeconds} seconds before requesting another OTP`
    };
  }
  
  // Check hourly limit (last 3 requests in last hour)
  const lastHour = phoneData.requests.filter(timestamp => now - timestamp < 60 * 60 * 1000);
  if (lastHour.length >= MAX_OTP_REQUESTS_PER_HOUR) {
    return {
      allowed: false,
      reason: 'Too many OTP requests. Please try again after 1 hour.'
    };
  }
  
  // Check daily limit
  if (phoneData.requests.length >= MAX_OTP_REQUESTS_PER_DAY) {
    return {
      allowed: false,
      reason: 'Maximum OTP requests reached for today. Please try again tomorrow.'
    };
  }
  
  // Check if phone is locked due to failed attempts
  const attemptData = verificationAttempts.get(phoneNumber);
  if (attemptData && attemptData.lockedUntil && now < attemptData.lockedUntil) {
    const waitMinutes = Math.ceil((attemptData.lockedUntil - now) / (60 * 1000));
    return {
      allowed: false,
      reason: `Phone number is temporarily locked. Please try again in ${waitMinutes} minutes.`
    };
  }
  
  return { allowed: true };
}

/**
 * Record OTP request
 */
function recordOTPRequest(phoneNumber) {
  const now = Date.now();
  const phoneData = rateLimitStore.get(phoneNumber) || { requests: [], lastRequest: 0 };
  phoneData.requests.push(now);
  phoneData.lastRequest = now;
  rateLimitStore.set(phoneNumber, phoneData);
}

/**
 * Check and update verification attempts
 */
function checkVerificationAttempts(phoneNumber, success) {
  const now = Date.now();
  const attemptData = verificationAttempts.get(phoneNumber) || { 
    failedAttempts: 0, 
    lastAttempt: 0,
    lockedUntil: null 
  };
  
  if (success) {
    // Clear attempts on success
    verificationAttempts.delete(phoneNumber);
    return { allowed: true };
  }
  
  // Increment failed attempts
  attemptData.failedAttempts++;
  attemptData.lastAttempt = now;
  
  // Lock if max attempts reached
  if (attemptData.failedAttempts >= MAX_VERIFICATION_ATTEMPTS) {
    attemptData.lockedUntil = now + (LOCKOUT_DURATION_MINUTES * 60 * 1000);
    verificationAttempts.set(phoneNumber, attemptData);
    return {
      allowed: false,
      reason: `Maximum verification attempts exceeded. Phone locked for ${LOCKOUT_DURATION_MINUTES} minutes.`
    };
  }
  
  verificationAttempts.set(phoneNumber, attemptData);
  return { 
    allowed: true, 
    attemptsRemaining: MAX_VERIFICATION_ATTEMPTS - attemptData.failedAttempts 
  };
}

export default {
  sendOTP,
  verifyOTP,
  resendOTP,
  clearOTP,
  formatPhoneNumber,
  isValidPhoneNumber
};
