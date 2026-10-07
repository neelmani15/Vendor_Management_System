import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../../common/types';
import { AuthService } from './auth.service';
import { sendSuccess } from '../../common/utils/response';

export class AuthController {
  public static async register(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const result = await AuthService.register(req.body);
      sendSuccess(res, result, 201);
    } catch (error) {
      next(error);
    }
  }

  public static async login(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const result = await AuthService.login(req.body);
      sendSuccess(res, result, 200);
    } catch (error) {
      next(error);
    }
  }

  public static async me(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const user = await AuthService.getProfile(req.user!.id);
      sendSuccess(res, user, 200);
    } catch (error) {
      next(error);
    }
  }
}
