import { PipeTransform, Injectable } from '@nestjs/common';
import { PAGINATION_DEFAULTS } from '@vttm/shared';

export class PaginationDto {
  page: number = PAGINATION_DEFAULTS.page;
  limit: number = PAGINATION_DEFAULTS.limit;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
  search?: string;
}

@Injectable()
export class ParsePaginationPipe implements PipeTransform<any, PaginationDto> {
  transform(value: any): PaginationDto {
    const dto = new PaginationDto();
    dto.page = Math.max(1, parseInt(value?.page, 10) || PAGINATION_DEFAULTS.page);
    dto.limit = Math.min(
      PAGINATION_DEFAULTS.maxLimit,
      Math.max(1, parseInt(value?.limit, 10) || PAGINATION_DEFAULTS.limit),
    );
    dto.sortBy = value?.sortBy;
    dto.sortOrder = value?.sortOrder === 'DESC' ? 'DESC' : 'ASC';
    dto.search = value?.search?.trim() || undefined;
    return dto;
  }
}
