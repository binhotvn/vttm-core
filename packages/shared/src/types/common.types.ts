export interface DateRange {
  from: Date | string;
  to: Date | string;
}

export type SortOrder = 'ASC' | 'DESC';

export interface PaginationQuery {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: SortOrder;
  search?: string;
}
