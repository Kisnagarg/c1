/**
 * Strict Phone and Email Validators for Rathore Electronics
 */

const BLOCKED_PHONE_PATTERNS = new Set([
  '0123456789',
  '1234567890',
  '9876543210',
  '9876543120',
  '9876543211',
  '9876543212',
  '9876543213',
  '9876543214',
  '9876543215',
  '9876543216',
  '9876543217',
  '9876543218',
  '9876543219',
  '9876500000',
  '9999900000',
  '8888800000',
  '7777700000',
  '6666600000',
  '9898989898',
  '9797979797',
  '9696969696',
  '9595959595',
  '9191919191',
  '9090909090',
  '8989898989',
  '8787878787',
  '7878787878',
  '7070707070'
]);

const BLOCKED_EMAIL_DOMAINS = new Set([
  'example.com',
  'example.org',
  'example.net',
  'test.com',
  'fake.com',
  'dummy.com',
  'tempmail.com',
  'temp-mail.org',
  'mailinator.com',
  'yopmail.com',
  '10minutemail.com',
  'guerrillamail.com',
  'trashmail.com',
  'dispostable.com',
  'sharklasers.com',
  'throwawaymail.com',
  'getairmail.com',
  'fakemail.net',
  'emailondeck.com',
  'burnermail.io',
  'mytrashmail.com',
  'maildrop.cc',
  'inboxkitten.com',
  'getnada.com',
  'asdf.com'
]);

const BLOCKED_EMAIL_PREFIXES = [
  'test@',
  'fake@',
  'dummy@',
  'temp@',
  'sample@',
  'asdf@',
  '12345@',
  '123456@',
  'qwerty@',
  'testing@',
  'noreply@',
  'null@'
];

/**
 * Clean phone number to 10-digit Indian standard
 */
function cleanPhone(phone) {
  if (!phone || typeof phone !== 'string') return '';
  // Remove all non-numeric characters
  let digits = phone.replace(/\D/g, '');
  
  // Remove leading 91 or +91 if 12 digits
  if (digits.length === 12 && digits.startsWith('91')) {
    digits = digits.slice(2);
  }
  // Remove leading 0 if 11 digits
  if (digits.length === 11 && digits.startsWith('0')) {
    digits = digits.slice(1);
  }
  return digits;
}

/**
 * Strict Indian mobile number validation
 * Rules:
 * - Exactly 10 digits
 * - Must start with 6, 7, 8, or 9
 * - Must not be a known dummy pattern (e.g. 9876543210, 9876543120)
 * - Must not be all repeated single digits (e.g. 9999999999, 8888888888)
 * - Must contain at least 4 unique digits
 */
function validateIndianPhone(phone) {
  const cleaned = cleanPhone(phone);

  if (!cleaned || cleaned.length !== 10) {
    return {
      isValid: false,
      message: 'Please enter a valid 10-digit mobile number.',
      cleaned
    };
  }

  // Check leading digit for Indian mobile network (6, 7, 8, 9)
  if (!/^[6-9]/.test(cleaned)) {
    return {
      isValid: false,
      message: 'Indian mobile numbers must start with 6, 7, 8, or 9.',
      cleaned
    };
  }

  // Check known dummy test numbers
  if (BLOCKED_PHONE_PATTERNS.has(cleaned)) {
    return {
      isValid: false,
      message: 'Dummy/test phone numbers are not permitted. Please enter your real mobile number.',
      cleaned
    };
  }

  // Check all identical digits (e.g. 9999999999)
  if (/^(\d)\1{9}$/.test(cleaned)) {
    return {
      isValid: false,
      message: 'Please enter a genuine mobile number (repeated digits are not valid).',
      cleaned
    };
  }

  // Check unique digit entropy (at least 4 distinct digits)
  const uniqueDigits = new Set(cleaned.split(''));
  if (uniqueDigits.size < 4) {
    return {
      isValid: false,
      message: 'Please enter a valid mobile number with at least 4 unique digits.',
      cleaned
    };
  }

  return {
    isValid: true,
    message: '',
    cleaned
  };
}

/**
 * Strict Email validation
 * Rules:
 * - Standard RFC format: username@domain.tld
 * - Reject disposable/temporary/fake email domains
 * - Reject placeholder/test usernames
 */
function validateEmail(email) {
  if (!email || typeof email !== 'string') {
    return {
      isValid: false,
      message: 'Email address is required.'
    };
  }

  const trimmed = email.toLowerCase().trim();

  // Basic RFC 5322 regex
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (!emailRegex.test(trimmed)) {
    return {
      isValid: false,
      message: 'Please enter a properly formatted email address (e.g. name@gmail.com).'
    };
  }

  // Check blocked prefixes
  for (const prefix of BLOCKED_EMAIL_PREFIXES) {
    if (trimmed.startsWith(prefix)) {
      return {
        isValid: false,
        message: 'Placeholder/test email addresses are not permitted. Please use your genuine email.'
      };
    }
  }

  // Check domain
  const domain = trimmed.split('@')[1];
  if (BLOCKED_EMAIL_DOMAINS.has(domain)) {
    return {
      isValid: false,
      message: `Emails from ${domain} are not allowed. Please provide a standard, permanent email address.`
    };
  }

  // Domain must contain a dot and at least 2 chars TLD
  const domainParts = domain.split('.');
  if (domainParts.length < 2 || domainParts[domainParts.length - 1].length < 2) {
    return {
      isValid: false,
      message: 'Please enter a valid email domain (e.g. .com, .in, .org).'
    };
  }

  return {
    isValid: true,
    message: '',
    email: trimmed
  };
}

module.exports = {
  cleanPhone,
  validateIndianPhone,
  validateEmail
};
