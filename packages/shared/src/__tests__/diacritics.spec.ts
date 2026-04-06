import { removeDiacritics, slugify } from '../utils/diacritics.util';

describe('Diacritics Utils', () => {
  describe('removeDiacritics', () => {
    it('should remove Vietnamese diacritics', () => {
      expect(removeDiacritics('Hồ Chí Minh')).toBe('Ho Chi Minh');
      expect(removeDiacritics('Đà Nẵng')).toBe('Da Nang');
      expect(removeDiacritics('Phú Nhuận')).toBe('Phu Nhuan');
    });

    it('should handle all Vietnamese vowels', () => {
      expect(removeDiacritics('àáảãạ')).toBe('aaaaa');
      expect(removeDiacritics('ăắằẳẵặ')).toBe('aaaaaa');
      expect(removeDiacritics('âầấẩẫậ')).toBe('aaaaaa');
      expect(removeDiacritics('đ')).toBe('d');
      expect(removeDiacritics('èéẻẽẹ')).toBe('eeeee');
      expect(removeDiacritics('êềếểễệ')).toBe('eeeeee');
      expect(removeDiacritics('ìíỉĩị')).toBe('iiiii');
      expect(removeDiacritics('òóỏõọ')).toBe('ooooo');
      expect(removeDiacritics('ôồốổỗộ')).toBe('oooooo');
      expect(removeDiacritics('ơờớởỡợ')).toBe('oooooo');
      expect(removeDiacritics('ùúủũụ')).toBe('uuuuu');
      expect(removeDiacritics('ưừứửữự')).toBe('uuuuuu');
      expect(removeDiacritics('ỳýỷỹỵ')).toBe('yyyyy');
    });

    it('should preserve case', () => {
      expect(removeDiacritics('ĐỒNG')).toBe('DONG');
    });

    it('should handle non-Vietnamese text', () => {
      expect(removeDiacritics('Hello World')).toBe('Hello World');
      expect(removeDiacritics('12345')).toBe('12345');
    });
  });

  describe('slugify', () => {
    it('should create URL-safe slugs', () => {
      expect(slugify('Hồ Chí Minh')).toBe('ho-chi-minh');
      expect(slugify('Quận 1')).toBe('quan-1');
      expect(slugify('Phường Bến Nghé')).toBe('phuong-ben-nghe');
    });

    it('should handle special characters', () => {
      expect(slugify('Đà Nẵng (DN)')).toBe('da-nang-dn');
    });
  });
});
