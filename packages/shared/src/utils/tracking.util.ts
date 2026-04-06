/**
 * Tracking number format: {PREFIX}-{YYYYMMDD}-{SEQUENCE}-{CHECK}
 * Example: NW-20260405-000042-3
 */

function luhnCheckDigit(numStr: string): number {
  const digits = numStr.replace(/\D/g, '').split('').map(Number);
  let sum = 0;
  let alternate = false;

  for (let i = digits.length - 1; i >= 0; i--) {
    let d = digits[i];
    if (alternate) {
      d *= 2;
      if (d > 9) d -= 9;
    }
    sum += d;
    alternate = !alternate;
  }

  return (10 - (sum % 10)) % 10;
}

/**
 * Format a date as YYYYMMDD.
 */
function formatDate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}${m}${d}`;
}

/**
 * Build a tracking number from components.
 * The sequence number should come from a Redis INCR or DB sequence.
 */
export function buildTrackingNumber(prefix: string, date: Date, sequence: number): string {
  const dateStr = formatDate(date);
  const seqStr = String(sequence).padStart(6, '0');
  const raw = `${dateStr}${seqStr}`;
  const check = luhnCheckDigit(raw);
  return `${prefix}-${dateStr}-${seqStr}-${check}`;
}

/**
 * Validate a tracking number format and check digit.
 */
export function isValidTrackingNumber(trackingNumber: string): boolean {
  const parts = trackingNumber.split('-');
  if (parts.length !== 4) return false;

  const [, dateStr, seqStr, checkStr] = parts;
  if (!/^\d{8}$/.test(dateStr) || !/^\d{6}$/.test(seqStr) || !/^\d$/.test(checkStr)) {
    return false;
  }

  const expectedCheck = luhnCheckDigit(`${dateStr}${seqStr}`);
  return expectedCheck === parseInt(checkStr, 10);
}
