import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../../common/types';
import { VendorDocumentService } from './vendor-document.service';
import { sendSuccess } from '../../common/utils/response';

export class VendorDocumentController {
  public static async create(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const doc = await VendorDocumentService.createDocument(req.body, req.user);
      sendSuccess(res, doc, 201);
    } catch (error) {
      next(error);
    }
  }

  public static async getById(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const doc = await VendorDocumentService.getDocumentById(req.params.id);
      sendSuccess(res, doc, 200);
    } catch (error) {
      next(error);
    }
  }

  public static async list(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const docs = await VendorDocumentService.listDocuments(req.query as any);
      sendSuccess(res, docs, 200);
    } catch (error) {
      next(error);
    }
  }

  public static async getByVendorId(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const docs = await VendorDocumentService.getDocumentsByVendorId(req.params.vendorId);
      sendSuccess(res, docs, 200);
    } catch (error) {
      next(error);
    }
  }

  public static async updateStatus(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const doc = await VendorDocumentService.updateDocumentStatus(
        req.params.id,
        req.body.status,
        req.user
      );
      sendSuccess(res, doc, 200);
    } catch (error) {
      next(error);
    }
  }

  public static async delete(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const result = await VendorDocumentService.deleteDocument(req.params.id, req.user);
      sendSuccess(res, result, 200);
    } catch (error) {
      next(error);
    }
  }

  public static async reviewCompliance(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const result = await VendorDocumentService.auditAndReviewVendorCompliance(
        req.params.vendorId,
        req.user,
        req.body?.notes,
        req.body?.overrideStatus
      );
      sendSuccess(res, result, 200);
    } catch (error) {
      next(error);
    }
  }

  public static async verifyAllDocuments(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const result = await VendorDocumentService.verifyAllPendingDocuments(
        req.params.vendorId,
        req.user
      );
      sendSuccess(res, result, 200);
    } catch (error) {
      next(error);
    }
  }
}
