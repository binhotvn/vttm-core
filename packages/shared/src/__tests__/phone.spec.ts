import { normalizeVnPhone, formatVnPhone, isValidVnPhone } from '../utils/phone.util';

describe('Phone Utils', () => {
  describe('normalizeVnPhone', () => {
    it('should normalize local format', () => {
      expect(normalizeVnPhone('0901234567')).toBe('+84901234567');
    });

    it('should normalize without + prefix', () => {
      expect(normalizeVnPhone('84901234567')).toBe('+84901234567');
    });

    it('should keep already normalized format', () => {
      expect(normalizeVnPhone('+84901234567')).toBe('+84901234567');
    });

    it('should strip spaces and dashes', () => {
      expect(normalizeVnPhone('090 123 4567')).toBe('+84901234567');
      expect(normalizeVnPhone('090-123-4567')).toBe('+84901234567');
    });

    it('should handle parentheses', () => {
      expect(normalizeVnPhone('(090) 123 4567')).toBe('+84901234567');
    });
  });

  describe('formatVnPhone', () => {
    it('should format for display', () => {
      expect(formatVnPhone('0901234567')).toBe('0901 234 567');
      expect(formatVnPhone('+84901234567')).toBe('0901 234 567');
    });
  });

  describe('isValidVnPhone', () => {
    it('should validate correct VN mobile numbers', () => {
      expect(isValidVnPhone('0901234567')).toBe(true);  // 09x
      expect(isValidVnPhone('0351234567')).toBe(true);  // 03x
      expect(isValidVnPhone('0561234567')).toBe(true);  // 05x
      expect(isValidVnPhone('0701234567')).toBe(true);  // 07x
      expect(isValidVnPhone('0811234567')).toBe(true);  // 08x
    });

    it('should validate +84 format', () => {
      expect(isValidVnPhone('+84901234567')).toBe(true);
    });

    it('should reject invalid numbers', () => {
      expect(isValidVnPhone('0101234567')).toBe(false);  // 01x invalid
      expect(isValidVnPhone('0201234567')).toBe(false);  // 02x (landline)
      expect(isValidVnPhone('090123456')).toBe(false);   // too short
      expect(isValidVnPhone('09012345678')).toBe(false);  // too long
      expect(isValidVnPhone('')).toBe(false);
      expect(isValidVnPhone('abc')).toBe(false);
    });
  });
});
