import { VendorRepository } from './vendor.repository';
import { CreateVendorInput, UpdateVendorInput, ListVendorsQuery } from './vendor.schema';
import { NotFoundError } from '../../common/errors';
import { AuditService } from '../audit/audit.service';
import { AuditAction } from '../../common/constants/enums';
import { AuthenticatedUser } from '../../common/types';

export class VendorService {
  public static async createVendor(data: CreateVendorInput, actor?: AuthenticatedUser) {
    const vendor = await VendorRepository.create(data);

    await AuditService.log({
      actorId: actor?.id,
      actorEmail: actor?.email,
      action: AuditAction.VENDOR_CREATED,
      entityType: 'Vendor',
      entityId: vendor._id.toString(),
      metadata: { name: vendor.name, category: vendor.categories },
    });

    return vendor;
  }

  public static async getVendorById(id: string) {
    const vendor = await VendorRepository.findById(id);
    if (!vendor) {
      throw new NotFoundError(`Vendor with ID ${id} not found`);
    }
    return vendor;
  }

  public static async updateVendor(id: string, data: UpdateVendorInput, actor?: AuthenticatedUser) {
    const existing = await VendorRepository.findById(id);
    if (!existing) {
      throw new NotFoundError(`Vendor with ID ${id} not found`);
    }

    const updated = await VendorRepository.update(id, data);

    const action =
      data.status && data.status !== existing.status
        ? AuditAction.VENDOR_STATUS_CHANGED
        : AuditAction.VENDOR_UPDATED;

    await AuditService.log({
      actorId: actor?.id,
      actorEmail: actor?.email,
      action,
      entityType: 'Vendor',
      entityId: id,
      metadata: { changes: Object.keys(data), previousStatus: existing.status, newStatus: data.status },
    });

    return updated;
  }

  public static async listVendors(query: ListVendorsQuery) {
    return VendorRepository.findWithFilters(query);
  }

  public static async deleteVendor(id: string, actor?: AuthenticatedUser) {
    const existing = await VendorRepository.findById(id);
    if (!existing) {
      throw new NotFoundError(`Vendor with ID ${id} not found`);
    }

    await VendorRepository.delete(id);

    await AuditService.log({
      actorId: actor?.id,
      actorEmail: actor?.email,
      action: AuditAction.VENDOR_STATUS_CHANGED,
      entityType: 'Vendor',
      entityId: id,
      metadata: { reason: 'Deleted vendor record' },
    });

    return { success: true };
  }
}
