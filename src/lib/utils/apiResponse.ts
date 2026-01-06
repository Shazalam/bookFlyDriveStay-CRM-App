import { NextResponse } from "next/server";

// Error codes for different scenarios
export const ErrorCode = {
  // Validation errors
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  REQUIRED_FIELD: 'REQUIRED_FIELD',
  INVALID_EMAIL: 'INVALID_EMAIL',
  INVALID_PASSWORD: 'INVALID_PASSWORD',
  
  // Authentication errors
  UNAUTHENTICATED: 'UNAUTHENTICATED',
  INVALID_CREDENTIALS: 'INVALID_CREDENTIALS',
  EXPIRED_TOKEN: 'EXPIRED_TOKEN',
  INVALID_TOKEN: 'INVALID_TOKEN',
  
  // Authorization errors
  UNAUTHORIZED: 'UNAUTHORIZED',
  INSUFFICIENT_PERMISSIONS: 'INSUFFICIENT_PERMISSIONS',
  
  // Resource errors
  NOT_FOUND: 'NOT_FOUND',
  ALREADY_EXISTS: 'ALREADY_EXISTS',
  CONFLICT: 'CONFLICT',
  
  // System errors
  INTERNAL_ERROR: 'INTERNAL_ERROR',
  EXTERNAL_SERVICE_ERROR: 'EXTERNAL_SERVICE_ERROR',
  DATABASE_ERROR: 'DATABASE_ERROR',
  
  // Rate limiting
  RATE_LIMITED: 'RATE_LIMITED',
  
  // Business logic errors
  BUSINESS_RULE_VIOLATION: 'BUSINESS_RULE_VIOLATION',
  INVALID_OPERATION: 'INVALID_OPERATION',
} as const;

export type ApiErrorCode = typeof ErrorCode[keyof typeof ErrorCode]
type SuccessResponse<T> = {
  success: true;
  data: T;
  message?: string;
  meta?: Record<string, any>
}

type ErrorResponse<T> = {
  success: false;
  error: {
    code: string;
    message: string;
    details?: any
  }
}


type ApiHeaders = Record<string, string>

export function apiSuccess<T>(
  data: T,
  message = "OK",
  status = 200,
  meta?: Record<string, any>,
  headers: ApiHeaders = {}
) {

  const body: SuccessResponse<T> = {
    success: true,
    data,
    message,
    ...(meta && { meta })
  }
  return new NextResponse(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json",
      ...headers,
    },
  });
}

export function apiError<T>(
  code: ApiErrorCode,
  message = "something went wrong",
  status = 500,
  details?: any,
  headers: ApiHeaders = {}
) {

  const body: ErrorResponse<T> = {
    success: false,
    error: {
      code,
      message,
      ...(details && { details })
    }

  }
  return new NextResponse(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json",
      ...headers,
    },
  });
}


