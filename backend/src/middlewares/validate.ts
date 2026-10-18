import { Request, Response, NextFunction } from 'express';
import { ZodSchema } from 'zod';

export function validate(schema: ZodSchema) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      req.body = schema.parse(req.body);
      next();
    } catch (error: any) {
      const details = error.errors?.map((e: any) => ({
        field: e.path.join('.'),
        issue: e.message,
      })) || [];

      return res.status(400).json({
        error: {
          code: 'VALIDATION_ERROR',
          message: details[0]?.issue || 'Data tidak valid',
          details,
        },
      });
    }
  };
}
