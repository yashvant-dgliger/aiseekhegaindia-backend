import bcrypt from "bcryptjs";
import crypto from "node:crypto";
import jwt from "jsonwebtoken";
import { prisma } from "../lib/prisma.js";
import { AppError } from "../middleware/errorHandler.js";
import { signAccessToken, signRefreshToken, type AuthUser } from "../middleware/auth.js";
import { env } from "../config/env.js";

function hashToken(token: string): string {
  return crypto.createHash("sha256").update(token).digest("hex");
}

function publicUser(user: { id: string; email: string; displayName: string | null; role: AuthUser["role"] }) {
  return {
    id: user.id,
    email: user.email,
    displayName: user.displayName,
    role: user.role,
  };
}

export async function registerUser(input: {
  email: string;
  password: string;
  displayName?: string;
}) {
  const existing = await prisma.user.findUnique({ where: { email: input.email.toLowerCase() } });
  if (existing) {
    throw new AppError(409, "EMAIL_TAKEN", "Email already registered");
  }

  const passwordHash = await bcrypt.hash(input.password, 10);
  const user = await prisma.user.create({
    data: {
      email: input.email.toLowerCase(),
      passwordHash,
      displayName: input.displayName,
    },
  });

  return issueTokens({ id: user.id, email: user.email, role: user.role }, user);
}

export async function loginUser(input: { email: string; password: string }) {
  const user = await prisma.user.findUnique({ where: { email: input.email.toLowerCase() } });
  if (!user || !user.isActive) {
    throw new AppError(401, "INVALID_CREDENTIALS", "Invalid email or password");
  }

  const ok = await bcrypt.compare(input.password, user.passwordHash);
  if (!ok) {
    throw new AppError(401, "INVALID_CREDENTIALS", "Invalid email or password");
  }

  return issueTokens({ id: user.id, email: user.email, role: user.role }, user);
}

async function issueTokens(authUser: AuthUser, user: { id: string; email: string; displayName: string | null; role: AuthUser["role"] }) {
  const accessToken = signAccessToken(authUser);
  const refreshToken = signRefreshToken(authUser.id);
  const decoded = jwt.decode(refreshToken) as { exp?: number } | null;
  const expiresAt = decoded?.exp
    ? new Date(decoded.exp * 1000)
    : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  await prisma.refreshToken.create({
    data: {
      userId: authUser.id,
      tokenHash: hashToken(refreshToken),
      expiresAt,
    },
  });

  return {
    user: publicUser(user),
    accessToken,
    refreshToken,
  };
}

export async function refreshSession(refreshToken: string) {
  let payload: { sub?: string };
  try {
    payload = jwt.verify(refreshToken, env.jwtRefreshSecret) as { sub?: string };
  } catch {
    throw new AppError(401, "INVALID_REFRESH", "Invalid refresh token");
  }

  const tokenHash = hashToken(refreshToken);
  const stored = await prisma.refreshToken.findFirst({
    where: {
      tokenHash,
      revokedAt: null,
      expiresAt: { gt: new Date() },
    },
  });

  if (!stored || !payload.sub || stored.userId !== payload.sub) {
    throw new AppError(401, "INVALID_REFRESH", "Invalid refresh token");
  }

  await prisma.refreshToken.update({
    where: { id: stored.id },
    data: { revokedAt: new Date() },
  });

  const user = await prisma.user.findUnique({ where: { id: payload.sub } });
  if (!user || !user.isActive) {
    throw new AppError(401, "UNAUTHORIZED", "User not found");
  }

  return issueTokens({ id: user.id, email: user.email, role: user.role }, user);
}

export async function logoutUser(userId: string, refreshToken?: string) {
  if (refreshToken) {
    await prisma.refreshToken.updateMany({
      where: { userId, tokenHash: hashToken(refreshToken), revokedAt: null },
      data: { revokedAt: new Date() },
    });
  } else {
    await prisma.refreshToken.updateMany({
      where: { userId, revokedAt: null },
      data: { revokedAt: new Date() },
    });
  }
}

export async function getMe(userId: string) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    throw new AppError(404, "NOT_FOUND", "User not found");
  }
  return publicUser(user);
}

export async function updateMe(userId: string, displayName?: string) {
  const user = await prisma.user.update({
    where: { id: userId },
    data: { displayName },
  });
  return publicUser(user);
}
