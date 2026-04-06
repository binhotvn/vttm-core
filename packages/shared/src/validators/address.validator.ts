import type { AddressJson } from '../types/address.types.js';
import type { ValidationResult } from './phone.validator.js';
import { isValidVnPhone } from '../utils/phone.util.js';

export function validateVnAddress(address: Partial<AddressJson>): ValidationResult {
  const errors: string[] = [];

  if (!address.contactName?.trim()) {
    errors.push('Tên người liên hệ không được để trống');
  }

  if (!address.phone?.trim()) {
    errors.push('Số điện thoại không được để trống');
  } else if (!isValidVnPhone(address.phone)) {
    errors.push('Số điện thoại không hợp lệ');
  }

  if (!address.provinceCode) {
    errors.push('Vui lòng chọn Tỉnh/Thành phố');
  }

  if (!address.districtCode) {
    errors.push('Vui lòng chọn Quận/Huyện');
  }

  if (!address.wardCode) {
    errors.push('Vui lòng chọn Phường/Xã');
  }

  if (!address.streetAddress?.trim()) {
    errors.push('Địa chỉ chi tiết không được để trống');
  }

  return { valid: errors.length === 0, errors };
}
