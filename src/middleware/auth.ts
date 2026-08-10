import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { Role } from "@prisma/client";
import { env } from "../config/env.js";
import { AppError } from "./errorHandler.js";

export type AuthUser = {
  id: string;
  email: string;
  role: Role;
};

declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}

type AccessPayload = {
  sub: string;
  email: string;
  role: Role;
};

export function signAccessToken(user: AuthUser): string {
  return jwt.sign(
    { email: user.email, role: user.role },
    env.jwtAccessSecret,
    { subject: user.id, expiresIn: env.jwtAccessExpiresIn as jwt.SignOptions["expiresIn"] },
  );
}

export function signRefreshToken(userId: string): string {
  return jwt.sign({}, env.jwtRefreshSecret, {
    subject: userId,
    expiresIn: env.jwtRefreshExpiresIn as jwt.SignOptions["expiresIn"],
  });
}

export function requireAuth(req: Request, _res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) {
    return next(new AppError(401, "UNAUTHORIZED", "Missing bearer token"));
  }

  try {
    const token = header.slice("Bearer ".length);
    const payload = jwt.verify(token, env.jwtAccessSecret) as AccessPayload & { sub: string };
    req.user = {
      id: payload.sub,
      email: payload.email,
      role: payload.role,
    };
    next();
  } catch {
    next(new AppError(401, "UNAUTHORIZED", "Invalid or expired token"));
  }
}

export function optionalAuth(req: Request, _res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) {
    return next();
  }
  try {
    const token = header.slice("Bearer ".length);
    const payload = jwt.verify(token, env.jwtAccessSecret) as AccessPayload & { sub: string };
    req.user = {
      id: payload.sub,
      email: payload.email,
      role: payload.role,
    };
  } catch {
    // ignore invalid optional token
  }
  next();
}

export function requireRole(...roles: Role[]) {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new AppError(401, "UNAUTHORIZED", "Authentication required"));
    }
    if (!roles.includes(req.user.role)) {
      return next(new AppError(403, "FORBIDDEN", "Insufficient role"));
    }
    next();
  };
}
