export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  timestamp: string;
}

export interface PaginatedMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  meta: PaginatedMeta;
  timestamp: string;
}

export interface ApiError {
  success: false;
  message: string;
  error?: string;
  statusCode: number;
  timestamp: string;
}
