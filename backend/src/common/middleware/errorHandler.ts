import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types';
import { AppError } from '../errors';
import { logger } from '../../config/logger';
import { sendError } from '../utils/response';
import { env } from '../../config/env';

export function errorHandler(
  err: Error,
  req: AuthenticatedRequest,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _next: NextFunction
): void {
  const requestId = req.requestId;

  // Handle custom AppError
  if (err instanceof AppError) {
    if (err.statusCode >= 500) {
      logger.error({ err, requestId }, `Operational error: ${err.message}`);
    } else {
      logger.warn({ code: err.code, message: err.message, requestId, details: err.details }, 'Client error');
    }
    sendError(res, err.code, err.message, err.statusCode, requestId, err.details);
    return;
  }

  // Handle Mongoose duplicate key error (E11000)
  if ((err as { code?: number }).code === 11000) {
    const keyPattern = (err as { keyPattern?: Record<string, number> }).keyPattern;
    const field = keyPattern ? Object.keys(keyPattern)[0] : 'field';
    sendError(res, 'DUPLICATE_ENTITY', `A record with this ${field} already exists`, 409, requestId);
    return;
  }

  // Handle Mongoose CastError (invalid ObjectId)
  if (err.name === 'CastError') {
    sendError(res, 'INVALID_IDENTIFIER', 'Invalid ID format provided', 400, requestId);
    return;
  }

  // Handle JWT errors
  if (err.name === 'JsonWebTokenError') {
    sendError(res, 'INVALID_TOKEN', 'Malformed or invalid authentication token', 401, requestId);
    return;
  }
  if (err.name === 'TokenExpiredError') {
    sendError(res, 'TOKEN_EXPIRED', 'Authentication token has expired', 401, requestId);
    return;
  }

  // Unhandled internal server errors
  logger.error({ err, requestId, stack: err.stack }, 'Unhandled Server Error');
  const message = env.NODE_ENV === 'production' ? 'An unexpected internal error occurred' : err.message;
  sendError(res, 'INTERNAL_SERVER_ERROR', message, 500, requestId);
}
