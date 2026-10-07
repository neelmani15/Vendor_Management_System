import { Response, NextFunction } from 'express';
import { AnyZodObject, ZodError } from 'zod';
import { AuthenticatedRequest } from '../types';
import { ValidationError } from '../errors';

export function validate(schema: AnyZodObject) {
  return async (req: AuthenticatedRequest, _res: Response, next: NextFunction): Promise<void> => {
    try {
      const parsed = await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      });

      if (parsed.body !== undefined) {
        req.body = parsed.body;
      }
      if (parsed.query !== undefined) {
        req.query = parsed.query as any;
      }
      if (parsed.params !== undefined) {
        req.params = parsed.params as any;
      }

      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const issues = error.errors.map((e) => ({
          path: e.path.join('.'),
          message: e.message,
        }));
        next(new ValidationError('Request validation failed', issues));
      } else {
        next(error);
      }
    }
  };
}
