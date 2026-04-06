import { buildTrackingNumber, isValidTrackingNumber } from '../utils/tracking.util';

describe('Tracking Number Utils', () => {
  describe('buildTrackingNumber', () => {
    it('should generate valid tracking number format', () => {
      const tn = buildTrackingNumber('NW', new Date(2026, 3, 5), 42);
      expect(tn).toMatch(/^NW-\d{8}-\d{6}-\d$/);
      expect(tn).toBe('NW-20260405-000042-7');
    });

    it('should generate different numbers for different sequences', () => {
      const tn1 = buildTrackingNumber('NW', new Date(2026, 3, 5), 1);
      const tn2 = buildTrackingNumber('NW', new Date(2026, 3, 5), 2);
      expect(tn1).not.toBe(tn2);
    });

    it('should work with different prefixes', () => {
      const tn = buildTrackingNumber('VT', new Date(2026, 0, 1), 1);
      expect(tn.startsWith('VT-')).toBe(true);
    });
  });

  describe('isValidTrackingNumber', () => {
    it('should validate correct tracking numbers', () => {
      const tn = buildTrackingNumber('NW', new Date(2026, 3, 5), 42);
      expect(isValidTrackingNumber(tn)).toBe(true);
    });

    it('should reject invalid formats', () => {
      expect(isValidTrackingNumber('')).toBe(false);
      expect(isValidTrackingNumber('INVALID')).toBe(false);
      expect(isValidTrackingNumber('NW-20260405-000042')).toBe(false); // missing check
      expect(isValidTrackingNumber('NW-2026040-000042-7')).toBe(false); // short date
    });

    it('should reject wrong check digit', () => {
      expect(isValidTrackingNumber('NW-20260405-000042-9')).toBe(false);
    });
  });
});
