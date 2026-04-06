/**
 * Vietnamese phone number utilities.
 * Valid VN mobile prefixes: 03x, 05x, 07x, 08x, 09x (10 digits total).
 */

const VN_PHONE_REGEX = /^(0[3|5|7|8|9])\d{8}$/;
const VN_PHONE_INTL_REGEX = /^\+84[3|5|7|8|9]\d{8}$/;

/**
 * Normalize a Vietnamese phone number to +84 international format.
 * Handles: 0901234567, 84901234567, +84901234567
 */
export function normalizeVnPhone(phone: string): string {
  const cleaned = phone.replace(/[\s\-().]/g, '');

  if (cleaned.startsWith('+84')) {
    return cleaned;
  }
  if (cleaned.startsWith('84') && cleaned.length === 11) {
    return `+${cleaned}`;
  }
  if (cleaned.startsWith('0') && cleaned.length === 10) {
    return `+84${cleaned.slice(1)}`;
  }
  return cleaned;
}

/**
 * Format a phone number for display: 0901 234 567
 */
export function formatVnPhone(phone: string): string {
  const normalized = normalizeVnPhone(phone);
  const local = normalized.replace('+84', '0');
  if (local.length !== 10) return local;
  return `${local.slice(0, 4)} ${local.slice(4, 7)} ${local.slice(7)}`;
}

/**
 * Validate a Vietnamese mobile phone number.
 */
export function isValidVnPhone(phone: string): boolean {
  const cleaned = phone.replace(/[\s\-().]/g, '');
  return VN_PHONE_REGEX.test(cleaned) || VN_PHONE_INTL_REGEX.test(cleaned);
}
