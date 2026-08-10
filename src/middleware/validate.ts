import type { NextFunction, Request, Response } from "express";
import type { ZodSchema } from "zod";

type Target = "body" | "query" | "params";

export function validate(schema: ZodSchema, target: Target = "body") {
  return (req: Request, _res: Response, next: NextFunction) => {
    const parsed = schema.safeParse(req[target]);
    if (!parsed.success) {
      return next(parsed.error);
    }
    (req as Request & Record<Target, unknown>)[target] = parsed.data;
    next();
  };
}
