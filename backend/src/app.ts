import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import mongoose from 'mongoose';
import { env } from './config/env';
import { logger } from './config/logger';
import { requestTracker } from './common/middleware/requestTracker';
import { errorHandler } from './common/middleware/errorHandler';
import { NotFoundError } from './common/errors';
import { authRoutes } from './modules/auth/auth.routes';
import { vendorRoutes } from './modules/vendors/vendor.routes';
import { vendorDocumentRoutes } from './modules/vendor-documents/vendor-document.routes';
import { workRequirementRoutes } from './modules/work-requirements/work-requirement.routes';
import { recommendationRoutes } from './modules/recommendations/recommendations.routes';
import { auditRoutes } from './modules/audit/audit.routes';
import { sendSuccess } from './common/utils/response';

export function createApp(): Application {
  const app = express();

  // Basic security and request parsing
  app.use(helmet());
  app.use(
    cors({
      origin: [env.CORS_ORIGIN, 'http://localhost:5173', 'http://127.0.0.1:5173'],
      credentials: true,
      exposedHeaders: ['x-request-id'],
    })
  );
  app.use(express.json({ limit: '1mb' }));
  app.use(express.urlencoded({ extended: true, limit: '1mb' }));

  // Request correlation tracking
  app.use(requestTracker);

  // Rate Limiting
  const limiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: env.NODE_ENV === 'test' ? 10000 : 300,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
      error: {
        code: 'RATE_LIMIT_EXCEEDED',
        message: 'Too many requests, please try again later',
      },
    },
  });
  app.use('/api/', limiter);

  // Request logging middleware
  app.use((req: Request, res: Response, next: NextFunction) => {
    const startTime = Date.now();
    res.on('finish', () => {
      const duration = Date.now() - startTime;
      if (req.path !== '/health') {
        logger.info(
          {
            method: req.method,
            path: req.originalUrl,
            status: res.statusCode,
            duration: `${duration}ms`,
            requestId: (req as any).requestId,
          },
          'HTTP Request'
        );
      }
    });
    next();
  });

  // Health check endpoint
  app.get('/health', (_req: Request, res: Response) => {
    const dbState = mongoose.connection.readyState;
    const dbStatus = dbState === 1 ? 'UP' : dbState === 2 ? 'CONNECTING' : 'DOWN';

    sendSuccess(res, {
      status: 'UP',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      database: dbStatus,
      environment: env.NODE_ENV,
      aiProvider: env.AI_PROVIDER,
    });
  });

  // Domain API Routes
  app.use('/api/v1/auth', authRoutes);
  app.use('/api/v1/vendors', vendorRoutes);
  app.use('/api/v1/vendor-documents', vendorDocumentRoutes);
  app.use('/api/v1/work-requirements', workRequirementRoutes);
  app.use('/api/v1/work-requirements/:id/recommendations', recommendationRoutes);
  app.use('/api/v1/audit-logs', auditRoutes);

  // 404 Handler
  app.use((req: Request) => {
    throw new NotFoundError(`Endpoint '${req.method} ${req.originalUrl}' not found`);
  });

  // Centralized Error Handler
  app.use(errorHandler);

  return app;
}
