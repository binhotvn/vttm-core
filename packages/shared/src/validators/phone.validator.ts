import { isValidVnPhone } from '../utils/phone.util.js';

export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

export function validateVnPhone(phone: string): ValidationResult {
  const errors: string[] = [];

  if (!phone || phone.trim().length === 0) {
    errors.push('Số điện thoại không được để trống');
    return { valid: false, errors };
  }

  if (!isValidVnPhone(phone)) {
    errors.push('Số điện thoại không hợp lệ. Định dạng: 0[3|5|7|8|9]xxxxxxxx');
  }

  return { valid: errors.length === 0, errors };
}
