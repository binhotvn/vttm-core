import { formatVND, parseVND } from '../utils/currency.util';

describe('Currency Utils', () => {
  describe('formatVND', () => {
    it('should format zero', () => {
      expect(formatVND(0)).toBe('0₫');
    });

    it('should format small amounts', () => {
      expect(formatVND(1000)).toBe('1.000₫');
      expect(formatVND(10000)).toBe('10.000₫');
    });

    it('should format large amounts', () => {
      expect(formatVND(1500000)).toBe('1.500.000₫');
      expect(formatVND(20000000)).toBe('20.000.000₫');
    });

    it('should round decimals (VND has no decimals)', () => {
      expect(formatVND(1500.5)).toBe('1.501₫');
      expect(formatVND(1500.4)).toBe('1.500₫');
    });

    it('should handle negative amounts', () => {
      expect(formatVND(-50000)).toBe('-50.000₫');
    });
  });

  describe('parseVND', () => {
    it('should parse formatted VND strings', () => {
      expect(parseVND('1.500.000₫')).toBe(1500000);
      expect(parseVND('10.000₫')).toBe(10000);
    });

    it('should handle empty or invalid strings', () => {
      expect(parseVND('')).toBe(0);
      expect(parseVND('abc')).toBe(0);
    });

    it('should handle plain numbers', () => {
      expect(parseVND('50000')).toBe(50000);
    });
  });
});
