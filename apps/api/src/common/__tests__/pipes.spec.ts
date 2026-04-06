import { ParsePaginationPipe, PaginationDto } from '../pipes/parse-pagination.pipe';

describe('ParsePaginationPipe', () => {
  const pipe = new ParsePaginationPipe();

  it('should use default values for empty input', () => {
    const result = pipe.transform({});
    expect(result.page).toBe(1);
    expect(result.limit).toBe(20);
    expect(result.sortOrder).toBe('ASC');
  });

  it('should parse valid page and limit', () => {
    const result = pipe.transform({ page: '3', limit: '50' });
    expect(result.page).toBe(3);
    expect(result.limit).toBe(50);
  });

  it('should cap limit at max', () => {
    const result = pipe.transform({ limit: '999' });
    expect(result.limit).toBe(100);
  });

  it('should enforce minimum page of 1', () => {
    const result = pipe.transform({ page: '-1' });
    expect(result.page).toBe(1);
  });

  it('should handle DESC sort order', () => {
    const result = pipe.transform({ sortOrder: 'DESC' });
    expect(result.sortOrder).toBe('DESC');
  });

  it('should default invalid sortOrder to ASC', () => {
    const result = pipe.transform({ sortOrder: 'INVALID' });
    expect(result.sortOrder).toBe('ASC');
  });

  it('should trim search string', () => {
    const result = pipe.transform({ search: '  hello  ' });
    expect(result.search).toBe('hello');
  });

  it('should set undefined search for empty string', () => {
    const result = pipe.transform({ search: '  ' });
    expect(result.search).toBeUndefined();
  });
});
