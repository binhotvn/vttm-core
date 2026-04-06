import type { AddressJson } from '../types/address.types.js';

/**
 * Format a Vietnamese address for display.
 * Output: "123 Nguyễn Huệ, Phường Bến Nghé, Quận 1, TP. Hồ Chí Minh"
 */
export function formatVnAddress(address: AddressJson): string {
  const parts: string[] = [];

  if (address.streetAddress) parts.push(address.streetAddress);
  if (address.wardName) parts.push(address.wardName);
  if (address.districtName) parts.push(address.districtName);
  if (address.provinceName) parts.push(address.provinceName);

  return parts.join(', ');
}

/**
 * Format address with contact info for labels.
 */
export function formatAddressWithContact(address: AddressJson): string {
  const lines: string[] = [];

  if (address.contactName) lines.push(address.contactName);
  if (address.phone) lines.push(address.phone);
  lines.push(formatVnAddress(address));
  if (address.landmark) lines.push(`(${address.landmark})`);
  if (address.notes) lines.push(`GC: ${address.notes}`);

  return lines.join('\n');
}

/**
 * Check if an address has Vietnam-specific fields populated.
 */
export function isVnAddress(address: AddressJson): boolean {
  return address.country === 'VN' && !!address.provinceCode && !!address.districtCode;
}
