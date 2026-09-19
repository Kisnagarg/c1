/**
 * Client-Side Phone and Email Validators for Rathore Electronics
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
 * Clean phone string to 10 digits
 */
export function cleanPhone(phone) {
  if (!phone || typeof phone !== 'string') return '';
  let digits = phone.replace(/\D/g, '');
  if (digits.length === 12 && digits.startsWith('91')) {
    digits = digits.slice(2);
  }
  if (digits.length === 11 && digits.startsWith('0')) {
    digits = digits.slice(1);
  }
  return digits;
}

/**
 * Strict Indian mobile validation
 */
export function validateIndianPhone(phone) {
  const cleaned = cleanPhone(phone);

  if (!cleaned) {
    return {
      isValid: false,
      message: 'Customer phone number is required.',
      cleaned
    };
  }

  if (cleaned.length !== 10) {
    return {
      isValid: false,
      message: `Phone number must be exactly 10 digits (currently ${cleaned.length} digits).`,
      cleaned
    };
  }

  if (!/^[6-9]/.test(cleaned)) {
    return {
      isValid: false,
      message: 'Indian mobile numbers must start with 6, 7, 8, or 9.',
      cleaned
    };
  }

  if (BLOCKED_PHONE_PATTERNS.has(cleaned)) {
    return {
      isValid: false,
      message: 'Dummy / test phone numbers (e.g. 9876543120) are not allowed.',
      cleaned
    };
  }

  if (/^(\d)\1{9}$/.test(cleaned)) {
    return {
      isValid: false,
      message: 'Repeated digits are not valid mobile numbers.',
      cleaned
    };
  }

  const uniqueDigits = new Set(cleaned.split(''));
  if (uniqueDigits.size < 4) {
    return {
      isValid: false,
      message: 'Please enter a genuine mobile number with at least 4 unique digits.',
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
 */
export function validateEmail(email) {
  if (!email || typeof email !== 'string') {
    return {
      isValid: false,
      message: 'Email address is required.'
    };
  }

  const trimmed = email.toLowerCase().trim();
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

  if (!emailRegex.test(trimmed)) {
    return {
      isValid: false,
      message: 'Please enter a valid email address (e.g. yourname@gmail.com).'
    };
  }

  for (const prefix of BLOCKED_EMAIL_PREFIXES) {
    if (trimmed.startsWith(prefix)) {
      return {
        isValid: false,
        message: 'Placeholder/test emails (e.g. test@..., fake@...) are not allowed.'
      };
    }
  }

  const domain = trimmed.split('@')[1];
  if (BLOCKED_EMAIL_DOMAINS.has(domain)) {
    return {
      isValid: false,
      message: `Emails from ${domain} are not allowed. Please provide your real email.`
    };
  }

  return {
    isValid: true,
    message: '',
    email: trimmed
  };
}
