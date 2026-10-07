import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../../common/types';
import { AuditService } from './audit.service';
import { sendSuccess } from '../../common/utils/response';

export class AuditController {
  public static async list(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const result = await AuditService.getLogs({
        entityType: req.query.entityType as string,
        entityId: req.query.entityId as string,
        actorId: req.query.actorId as string,
        action: req.query.action as string,
        limit: req.query.limit ? parseInt(req.query.limit as string, 10) : 50,
        offset: req.query.offset ? parseInt(req.query.offset as string, 10) : 0,
      });

      sendSuccess(res, result.logs, 200, {
        total: result.total,
        limit: result.limit,
        offset: result.offset,
      });
    } catch (error) {
      next(error);
    }
  }
}
