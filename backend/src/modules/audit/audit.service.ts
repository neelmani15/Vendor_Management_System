import { AuditLogModel } from './audit-log.model';
import { AuditAction } from '../../common/constants/enums';
import { logger } from '../../config/logger';

export interface CreateAuditLogParams {
  actorId?: string;
  actorEmail?: string;
  action: AuditAction;
  entityType: string;
  entityId?: string;
  metadata?: Record<string, unknown>;
}

export class AuditService {
  public static async log(params: CreateAuditLogParams): Promise<void> {
    try {
      // Ensure no sensitive fields like passwords, secrets, or tokens are logged
      const safeMetadata = params.metadata ? { ...params.metadata } : {};
      delete safeMetadata.password;
      delete safeMetadata.passwordHash;
      delete safeMetadata.token;
      delete safeMetadata.apiKey;

      await AuditLogModel.create({
        ...params,
        metadata: safeMetadata,
        timestamp: new Date(),
      });
    } catch (error) {
      logger.error({ error, params }, 'Failed to record audit log');
      // Non-blocking: audit log failure should not crash core operation
    }
  }

  public static async getLogs(query: {
    entityType?: string;
    entityId?: string;
    actorId?: string;
    action?: string;
    limit?: number;
    offset?: number;
  }) {
    const filter: Record<string, unknown> = {};
    if (query.entityType) filter.entityType = query.entityType;
    if (query.entityId) filter.entityId = query.entityId;
    if (query.actorId) filter.actorId = query.actorId;
    if (query.action) filter.action = query.action;

    const limit = Math.min(query.limit || 50, 100);
    const offset = query.offset || 0;

    const [logs, total] = await Promise.all([
      AuditLogModel.find(filter).sort({ timestamp: -1 }).skip(offset).limit(limit).lean(),
      AuditLogModel.countDocuments(filter),
    ]);

    return { logs, total, limit, offset };
  }
}
