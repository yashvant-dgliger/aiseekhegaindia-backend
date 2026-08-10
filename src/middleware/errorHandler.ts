import type { NextFunction, Request, Response } from "express";

export class AppError extends Error {
  statusCode: number;
  code: string;

  constructor(statusCode: number, code: string, message: string) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
  }
}

export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
) {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      error: { code: err.code, message: err.message },
    });
  }

  if (err && typeof err === "object" && "name" in err && (err as { name: string }).name === "ZodError") {
    return res.status(400).json({
      error: {
        code: "VALIDATION_ERROR",
        message: "Invalid request",
        details: (err as { issues?: unknown }).issues,
      },
    });
  }

  console.error(err);
  return res.status(500).json({
    error: { code: "INTERNAL_ERROR", message: "Internal server error" },
  });
}

export function notFoundHandler(_req: Request, res: Response) {
  res.status(404).json({
    error: { code: "NOT_FOUND", message: "Route not found" },
  });
}
