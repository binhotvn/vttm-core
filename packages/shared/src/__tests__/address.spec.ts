import { formatVnAddress, formatAddressWithContact, isVnAddress } from '../utils/address.util';

describe('Address Utils', () => {
  const sampleAddress = {
    contactName: 'Nguyễn Văn A',
    phone: '0901234567',
    streetAddress: '123 Nguyễn Huệ',
    wardName: 'Phường Bến Nghé',
    districtName: 'Quận 1',
    provinceName: 'TP. Hồ Chí Minh',
    country: 'VN',
  };

  describe('formatVnAddress', () => {
    it('should format full Vietnamese address', () => {
      expect(formatVnAddress(sampleAddress)).toBe(
        '123 Nguyễn Huệ, Phường Bến Nghé, Quận 1, TP. Hồ Chí Minh',
      );
    });

    it('should handle missing fields', () => {
      expect(formatVnAddress({ ...sampleAddress, wardName: undefined })).toBe(
        '123 Nguyễn Huệ, Quận 1, TP. Hồ Chí Minh',
      );
    });
  });

  describe('isVnAddress', () => {
    it('should detect VN addresses', () => {
      expect(isVnAddress({ ...sampleAddress, provinceCode: '79', districtCode: '760' })).toBe(true);
    });

    it('should reject non-VN addresses', () => {
      expect(isVnAddress({ ...sampleAddress, country: 'US' })).toBe(false);
      expect(isVnAddress({ ...sampleAddress, provinceCode: undefined })).toBe(false);
    });
  });

  describe('formatAddressWithContact', () => {
    it('should include contact info', () => {
      const result = formatAddressWithContact(sampleAddress);
      expect(result).toContain('Nguyễn Văn A');
      expect(result).toContain('0901234567');
    });

    it('should include landmark if present', () => {
      const result = formatAddressWithContact({ ...sampleAddress, landmark: 'Đối diện chợ Bến Thành' });
      expect(result).toContain('Đối diện chợ Bến Thành');
    });
  });
});
