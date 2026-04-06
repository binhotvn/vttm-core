import { validateVnPhone } from '../validators/phone.validator';
import { validateVnAddress } from '../validators/address.validator';

describe('Validators', () => {
  describe('validateVnPhone', () => {
    it('should pass valid phone numbers', () => {
      const result = validateVnPhone('0901234567');
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should fail empty phone', () => {
      const result = validateVnPhone('');
      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it('should fail invalid phone', () => {
      const result = validateVnPhone('0101234567');
      expect(result.valid).toBe(false);
    });
  });

  describe('validateVnAddress', () => {
    it('should pass valid address', () => {
      const result = validateVnAddress({
        contactName: 'Test',
        phone: '0901234567',
        provinceCode: '79',
        districtCode: '760',
        wardCode: '26734',
        streetAddress: '123 Test St',
        country: 'VN',
      });
      expect(result.valid).toBe(true);
    });

    it('should fail missing contactName', () => {
      const result = validateVnAddress({
        phone: '0901234567',
        provinceCode: '79',
        districtCode: '760',
        wardCode: '26734',
        streetAddress: '123 Test St',
        country: 'VN',
      });
      expect(result.valid).toBe(false);
    });

    it('should fail missing province', () => {
      const result = validateVnAddress({
        contactName: 'Test',
        phone: '0901234567',
        districtCode: '760',
        wardCode: '26734',
        streetAddress: '123 Test St',
        country: 'VN',
      });
      expect(result.valid).toBe(false);
    });

    it('should fail invalid phone', () => {
      const result = validateVnAddress({
        contactName: 'Test',
        phone: '0101234567',
        provinceCode: '79',
        districtCode: '760',
        wardCode: '26734',
        streetAddress: '123 Test St',
        country: 'VN',
      });
      expect(result.valid).toBe(false);
    });
  });
});
