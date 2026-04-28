export interface ApiSuccessResponse<T> {
  success: true;
  statusCode: number;
  message: string;
  data: T | null;
}

export interface ApiErrorResponse {
  success: false;
  statusCode: number;
  path: string;
  timestamp: string;
  message: string;
  errors?: string[] | Record<string, string[]>;
}

export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse;

export interface ApiListResponse<T> {
  items: T[];
  total: number;
  current: number;
  limit: number;
  totalPages: number;
}

export interface FilterQuery {
  current?: number;
  limit?: number;
}

export interface FilterBody<T> {
  current?: number;
  limit?: number;
  filter?: T;
}
