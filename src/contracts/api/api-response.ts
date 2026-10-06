/**
 * Unified API Response Envelope Contracts
 * Guarantees consistent response structures across all route handlers.
 */

export interface ApiResponseSuccess<T> {
  success: true;
  data: T;
  meta?: {
    timestamp: string;
    requestId?: string;
    pagination?: {
      page: number;
      pageSize: number;
      totalItems: number;
      totalPages: number;
    };
  };
}

export interface ApiErrorDetail {
  field?: string;
  code: string;
  message: string;
}

export interface ApiResponseError {
  success: false;
  error: {
    code: string;
    message: string;
    details?: ApiErrorDetail[];
    timestamp: string;
    requestId?: string;
  };
}

export type ApiResponse<T> = ApiResponseSuccess<T> | ApiResponseError;
