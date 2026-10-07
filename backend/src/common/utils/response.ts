import { Response } from 'express';
import { ApiResponse, ApiErrorResponse, PaginationMeta } from '../types';

export function sendSuccess<T>(
  res: Response,
  data: T,
  statusCode = 200,
  meta?: PaginationMeta | Record<string, unknown>
): Response {
  const payload: ApiResponse<T> = { data };
  if (meta) {
    payload.meta = meta;
  }
  return res.status(statusCode).json(payload);
}

export function sendError(
  res: Response,
  code: string,
  message: string,
  statusCode = 500,
  requestId?: string,
  details?: unknown
): Response {
  const payload: ApiErrorResponse = {
    error: {
      code,
      message,
      requestId,
      details,
    },
  };
  return res.status(statusCode).json(payload);
}
