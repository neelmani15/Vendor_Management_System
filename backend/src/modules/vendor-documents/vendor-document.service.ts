import { VendorDocumentRepository } from './vendor-document.repository';
import { CreateDocumentInput, ListDocumentsQuery } from './vendor-document.schema';
import { NotFoundError } from '../../common/errors';
import { DocumentStatus, ComplianceStatus, AuditAction } from '../../common/constants/enums';
import { VendorModel } from '../vendors/vendor.model';
import { AuditService } from '../audit/audit.service';
import { AuthenticatedUser } from '../../common/types';

export class VendorDocumentService {
  /**
   * Recalculates and updates the overall compliance status of a vendor based on its documents
   */
  public static async recalculateVendorCompliance(vendorId: string): Promise<ComplianceStatus> {
    const docs = await VendorDocumentRepository.findByVendorId(vendorId);
    const now = new Date();

    if (docs.length === 0) {
      await VendorModel.findByIdAndUpdate(vendorId, { complianceStatus: ComplianceStatus.UNDER_REVIEW });
      return ComplianceStatus.UNDER_REVIEW;
    }

    let hasExpired = false;
    let hasExpiringSoon = false;
    let hasPending = false;
    let hasRejected = false;

    for (const doc of docs) {
      const isPastExpiry = new Date(doc.expiresAt) < now;
      if (isPastExpiry || doc.status === DocumentStatus.EXPIRED) {
        hasExpired = true;
      } else if (doc.status === DocumentStatus.REJECTED) {
        hasRejected = true;
      } else if (doc.status === DocumentStatus.PENDING_VERIFICATION) {
        hasPending = true;
      } else {
        const daysToExpiry = (new Date(doc.expiresAt).getTime() - now.getTime()) / (1000 * 3600 * 24);
        if (daysToExpiry <= 30 || doc.status === DocumentStatus.EXPIRING_SOON) {
          hasExpiringSoon = true;
        }
      }
    }

    let calculatedStatus: ComplianceStatus = ComplianceStatus.COMPLIANT;
    if (hasExpired || hasRejected) {
      calculatedStatus = ComplianceStatus.NON_COMPLIANT;
    } else if (hasExpiringSoon) {
      calculatedStatus = ComplianceStatus.EXPIRING_SOON;
    } else if (hasPending) {
      calculatedStatus = ComplianceStatus.UNDER_REVIEW;
    }

    await VendorModel.findByIdAndUpdate(vendorId, { complianceStatus: calculatedStatus });
    return calculatedStatus;
  }

  public static async createDocument(data: CreateDocumentInput, actor?: AuthenticatedUser) {
    const vendor = await VendorModel.findById(data.vendorId);
    if (!vendor) {
      throw new NotFoundError(`Vendor with ID ${data.vendorId} not found`);
    }

    // Auto-calculate initial document status based on expiry date
    const now = new Date();
    const expiry = new Date(data.expiresAt);
    let initialStatus = data.status || DocumentStatus.VALID;

    if (expiry < now) {
      initialStatus = DocumentStatus.EXPIRED;
    } else {
      const daysUntilExpiry = (expiry.getTime() - now.getTime()) / (1000 * 3600 * 24);
      if (daysUntilExpiry <= 30 && initialStatus === DocumentStatus.VALID) {
        initialStatus = DocumentStatus.EXPIRING_SOON;
      }
    }

    const document = await VendorDocumentRepository.create({
      ...data,
      status: initialStatus,
    });

    await this.recalculateVendorCompliance(data.vendorId);

    await AuditService.log({
      actorId: actor?.id,
      actorEmail: actor?.email,
      action: AuditAction.DOCUMENT_UPLOADED,
      entityType: 'VendorDocument',
      entityId: document._id.toString(),
      metadata: { vendorId: data.vendorId, documentType: data.documentType, status: initialStatus },
    });

    return document;
  }

  public static async getDocumentById(id: string) {
    const doc = await VendorDocumentRepository.findById(id);
    if (!doc) {
      throw new NotFoundError(`Document with ID ${id} not found`);
    }
    return doc;
  }

  public static async getDocumentsByVendorId(vendorId: string) {
    return VendorDocumentRepository.findByVendorId(vendorId);
  }

  public static async listDocuments(query: ListDocumentsQuery) {
    return VendorDocumentRepository.findWithFilters(query);
  }

  public static async updateDocumentStatus(id: string, status: DocumentStatus, actor?: AuthenticatedUser) {
    const doc = await VendorDocumentRepository.findById(id);
    if (!doc) {
      throw new NotFoundError(`Document with ID ${id} not found`);
    }

    const updated = await VendorDocumentRepository.updateStatus(id, status);
    if (updated) {
      await this.recalculateVendorCompliance(updated.vendorId.toString());
    }

    const action =
      status === DocumentStatus.VALID
        ? AuditAction.DOCUMENT_VERIFIED
        : status === DocumentStatus.REJECTED
        ? AuditAction.DOCUMENT_REJECTED
        : AuditAction.DOCUMENT_UPLOADED;

    await AuditService.log({
      actorId: actor?.id,
      actorEmail: actor?.email,
      action,
      entityType: 'VendorDocument',
      entityId: id,
      metadata: { previousStatus: doc.status, newStatus: status, vendorId: doc.vendorId.toString() },
    });

    return updated;
  }

  public static async deleteDocument(id: string, actor?: AuthenticatedUser) {
    const doc = await VendorDocumentRepository.findById(id);
    if (!doc) {
      throw new NotFoundError(`Document with ID ${id} not found`);
    }

    await VendorDocumentRepository.delete(id);
    await this.recalculateVendorCompliance(doc.vendorId.toString());

    await AuditService.log({
      actorId: actor?.id,
      actorEmail: actor?.email,
      action: AuditAction.DOCUMENT_REJECTED,
      entityType: 'VendorDocument',
      entityId: id,
      metadata: { reason: 'Deleted document metadata' },
    });

    return { success: true };
  }

  /**
   * Explicit compliance audit and review flow for a vendor.
   * Compiles audit findings, updates vendor compliance state, and produces immutable audit records.
   */
  public static async auditAndReviewVendorCompliance(
    vendorId: string,
    actor?: AuthenticatedUser,
    notes?: string,
    overrideStatus?: ComplianceStatus
  ) {
    const vendor = await VendorModel.findById(vendorId);
    if (!vendor) {
      throw new NotFoundError(`Vendor with ID ${vendorId} not found`);
    }

    const docs = await VendorDocumentRepository.findByVendorId(vendorId);
    const now = new Date();
    const findings: string[] = [];

    let validCount = 0;
    let expiringSoonCount = 0;
    let expiredCount = 0;
    let pendingCount = 0;
    let rejectedCount = 0;

    for (const doc of docs) {
      const isPastExpiry = new Date(doc.expiresAt) < now;
      if (isPastExpiry || doc.status === DocumentStatus.EXPIRED) {
        expiredCount++;
        findings.push(
          `${doc.documentType.replace('_', ' ')} (${doc.documentNumber}) is expired since ${new Date(doc.expiresAt).toLocaleDateString()}`
        );
      } else if (doc.status === DocumentStatus.REJECTED) {
        rejectedCount++;
        findings.push(
          `${doc.documentType.replace('_', ' ')} (${doc.documentNumber}) was rejected during verification`
        );
      } else if (doc.status === DocumentStatus.PENDING_VERIFICATION) {
        pendingCount++;
        findings.push(
          `${doc.documentType.replace('_', ' ')} (${doc.documentNumber}) is pending review`
        );
      } else {
        const daysToExpiry = Math.ceil(
          (new Date(doc.expiresAt).getTime() - now.getTime()) / (1000 * 3600 * 24)
        );
        if (daysToExpiry <= 30 || doc.status === DocumentStatus.EXPIRING_SOON) {
          expiringSoonCount++;
          findings.push(
            `${doc.documentType.replace('_', ' ')} (${doc.documentNumber}) expires in ${daysToExpiry} day(s)`
          );
        } else {
          validCount++;
        }
      }
    }

    let calculatedStatus: ComplianceStatus = ComplianceStatus.COMPLIANT;
    if (expiredCount > 0 || rejectedCount > 0) {
      calculatedStatus = ComplianceStatus.NON_COMPLIANT;
    } else if (expiringSoonCount > 0) {
      calculatedStatus = ComplianceStatus.EXPIRING_SOON;
    } else if (pendingCount > 0 || docs.length === 0) {
      calculatedStatus = ComplianceStatus.UNDER_REVIEW;
    }

    const finalStatus = overrideStatus || calculatedStatus;
    const previousStatus = vendor.complianceStatus;

    await VendorModel.findByIdAndUpdate(vendorId, { complianceStatus: finalStatus });

    await AuditService.log({
      actorId: actor?.id,
      actorEmail: actor?.email,
      action: AuditAction.VENDOR_COMPLIANCE_REVIEWED,
      entityType: 'Vendor',
      entityId: vendorId,
      metadata: {
        vendorName: vendor.name,
        previousStatus,
        newStatus: finalStatus,
        findingsCount: findings.length,
        notes: notes || 'Audit & compliance review completed',
      },
    });

    return {
      vendorId,
      vendorName: vendor.name,
      previousStatus,
      newStatus: finalStatus,
      documentsSummary: {
        total: docs.length,
        valid: validCount,
        expiringSoon: expiringSoonCount,
        expired: expiredCount,
        pendingVerification: pendingCount,
        rejected: rejectedCount,
      },
      findings: findings.length > 0 ? findings : ['All compliance documents are active, verified, and unexpired.'],
      notes: notes || '',
      reviewedAt: new Date(),
      reviewedBy: actor?.email || 'System Auditor',
    };
  }

  /**
   * Batch verifies all pending documents for a vendor in one operational click
   */
  public static async verifyAllPendingDocuments(vendorId: string, actor?: AuthenticatedUser) {
    const docs = await VendorDocumentRepository.findByVendorId(vendorId);
    const pendingDocs = docs.filter((d) => d.status === DocumentStatus.PENDING_VERIFICATION);

    for (const doc of pendingDocs) {
      await VendorDocumentRepository.updateStatus(doc._id.toString(), DocumentStatus.VALID);
    }

    return this.auditAndReviewVendorCompliance(
      vendorId,
      actor,
      `Batch verified ${pendingDocs.length} pending document(s)`
    );
  }
}
