import { WorkRequirementRepository } from './work-requirement.repository';
import { CreateWorkRequirementInput, UpdateWorkRequirementInput, ListWorkRequirementsQuery } from './work-requirement.schema';
import { NotFoundError } from '../../common/errors';
import { AuditService } from '../audit/audit.service';
import { AuditAction } from '../../common/constants/enums';
import { AuthenticatedUser } from '../../common/types';

export class WorkRequirementService {
  public static async createRequirement(data: CreateWorkRequirementInput, actor: AuthenticatedUser) {
    const requirement = await WorkRequirementRepository.create(data, actor.id);

    await AuditService.log({
      actorId: actor.id,
      actorEmail: actor.email,
      action: AuditAction.WORK_REQUIREMENT_CREATED,
      entityType: 'WorkRequirement',
      entityId: requirement._id.toString(),
      metadata: { title: requirement.title, category: requirement.category, priority: requirement.priority },
    });

    return requirement;
  }

  public static async getRequirementById(id: string) {
    const req = await WorkRequirementRepository.findById(id);
    if (!req) {
      throw new NotFoundError(`Work requirement with ID ${id} not found`);
    }
    return req;
  }

  public static async updateRequirement(
    id: string,
    data: UpdateWorkRequirementInput,
    actor?: AuthenticatedUser
  ) {
    const existing = await WorkRequirementRepository.findById(id);
    if (!existing) {
      throw new NotFoundError(`Work requirement with ID ${id} not found`);
    }

    const updated = await WorkRequirementRepository.update(id, data);

    await AuditService.log({
      actorId: actor?.id,
      actorEmail: actor?.email,
      action: AuditAction.WORK_REQUIREMENT_UPDATED,
      entityType: 'WorkRequirement',
      entityId: id,
      metadata: { changes: Object.keys(data), previousStatus: existing.status, newStatus: data.status },
    });

    return updated;
  }

  public static async listRequirements(query: ListWorkRequirementsQuery) {
    return WorkRequirementRepository.findWithFilters(query);
  }

  public static async deleteRequirement(id: string, actor?: AuthenticatedUser) {
    const existing = await WorkRequirementRepository.findById(id);
    if (!existing) {
      throw new NotFoundError(`Work requirement with ID ${id} not found`);
    }

    await WorkRequirementRepository.delete(id);

    await AuditService.log({
      actorId: actor?.id,
      actorEmail: actor?.email,
      action: AuditAction.WORK_REQUIREMENT_UPDATED,
      entityType: 'WorkRequirement',
      entityId: id,
      metadata: { reason: 'Deleted work requirement' },
    });

    return { success: true };
  }
}
