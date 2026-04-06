/**
 * Format a number as Vietnamese Dong (VND).
 * VND has no decimal places. Uses dot as thousands separator.
 * Example: 1500000 -> "1.500.000₫"
 */
export function formatVND(amount: number): string {
  const formatted = Math.round(amount)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  return `${formatted}₫`;
}

/**
 * Parse a VND string back to number.
 * Example: "1.500.000₫" -> 1500000
 */
export function parseVND(vndString: string): number {
  return parseInt(vndString.replace(/[.₫\s]/g, ''), 10) || 0;
}
