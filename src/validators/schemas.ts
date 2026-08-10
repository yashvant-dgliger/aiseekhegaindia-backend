import { z } from "zod";

export const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).max(128),
  displayName: z.string().min(1).max(120).optional(),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const refreshSchema = z.object({
  refreshToken: z.string().min(1),
});

export const updateMeSchema = z.object({
  displayName: z.string().min(1).max(120).optional(),
});

export const upsertProgressSchema = z.object({
  status: z.enum(["started", "completed"]),
  progressPct: z.number().int().min(0).max(100).optional(),
});

export const fellowshipApplicationSchema = z.object({
  fullName: z.string().min(1).max(200),
  email: z.string().email(),
  background: z.string().max(5000).optional(),
  motivation: z.string().max(5000).optional(),
  cohortId: z.string().uuid().optional(),
});

export const adminPatchApplicationSchema = z.object({
  status: z.enum(["submitted", "reviewing", "accepted", "rejected", "waitlisted"]),
  cohortId: z.string().uuid().nullable().optional(),
});

export const createCohortSchema = z.object({
  name: z.string().min(1).max(200),
  startsOn: z.string().optional(),
  endsOn: z.string().optional(),
  isActive: z.boolean().optional(),
});

export const patchCohortSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  startsOn: z.string().nullable().optional(),
  endsOn: z.string().nullable().optional(),
  isActive: z.boolean().optional(),
});
