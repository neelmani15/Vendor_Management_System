import { Response, NextFunction } from 'express';
import { randomUUID } from 'crypto';
import { AuthenticatedRequest } from '../types';

export function requestTracker(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
  const incomingId = req.headers['x-request-id'];
  const requestId = typeof incomingId === 'string' && incomingId.trim() ? incomingId : randomUUID();
  
  req.requestId = requestId;
  res.setHeader('x-request-id', requestId);
  next();
}
