import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../../common/types';
import { VendorService } from './vendor.service';
import { sendSuccess } from '../../common/utils/response';

export class VendorController {
  public static async create(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const vendor = await VendorService.createVendor(req.body, req.user);
      sendSuccess(res, vendor, 201);
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
      const vendor = await VendorService.getVendorById(req.params.id);
      sendSuccess(res, vendor, 200);
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
      const result = await VendorService.listVendors(req.query as any);
      sendSuccess(res, result.items, 200, {
        total: result.total,
        limit: result.limit,
        offset: result.offset,
        page: result.page,
        totalPages: result.totalPages,
      });
    } catch (error) {
      next(error);
    }
  }

  public static async update(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const vendor = await VendorService.updateVendor(req.params.id, req.body, req.user);
      sendSuccess(res, vendor, 200);
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
      const result = await VendorService.deleteVendor(req.params.id, req.user);
      sendSuccess(res, result, 200);
    } catch (error) {
      next(error);
    }
  }
}
