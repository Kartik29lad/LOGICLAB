import { NextResponse } from "next/server";

import type { ApiResponseError, ApiResponseSuccess } from "../../contracts/api/api-response";

export class ApiResponseBuilder {
  /**
   * Builds a standardized HTTP success response.
   */
  public static success<T>(
    data: T,
    options?: {
      requestId?: string;
      statusCode?: number;
      pagination?: {
        page: number;
        pageSize: number;
        totalItems: number;
        totalPages: number;
      };
    }
  ): NextResponse<ApiResponseSuccess<T>> {
    const statusCode = options?.statusCode ?? 200;
    const body: ApiResponseSuccess<T> = {
      success: true,
      data,
      meta: {
        timestamp: new Date().toISOString(),
        ...(options?.requestId && { requestId: options.requestId }),
        ...(options?.pagination && { pagination: options.pagination }),
      },
    };

    const response = NextResponse.json(body, { status: statusCode });
    if (options?.requestId) {
      response.headers.set("x-request-id", options.requestId);
    }
    return response;
  }

  /**
   * Builds a standardized HTTP error response.
   */
  public static error(
    code: string,
    message: string,
    options?: {
      statusCode?: number;
      requestId?: string;
      details?: { field?: string; code: string; message: string }[];
    }
  ): NextResponse<ApiResponseError> {
    const statusCode = options?.statusCode ?? 500;
    const body: ApiResponseError = {
      success: false,
      error: {
        code,
        message,
        timestamp: new Date().toISOString(),
        ...(options?.requestId && { requestId: options.requestId }),
        ...(options?.details && { details: options.details }),
      },
    };

    const response = NextResponse.json(body, { status: statusCode });
    if (options?.requestId) {
      response.headers.set("x-request-id", options.requestId);
    }
    return response;
  }
}
