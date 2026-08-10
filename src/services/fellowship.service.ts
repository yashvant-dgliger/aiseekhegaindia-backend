import { ApplicationStatus } from "@prisma/client";
import { prisma } from "../lib/prisma.js";
import { AppError } from "../middleware/errorHandler.js";

export async function listActiveCohorts() {
  return prisma.cohort.findMany({
    where: { isActive: true },
    orderBy: { startsOn: "asc" },
    select: {
      id: true,
      name: true,
      startsOn: true,
      endsOn: true,
      isActive: true,
    },
  });
}

export async function createApplication(
  input: {
    fullName: string;
    email: string;
    background?: string;
    motivation?: string;
    cohortId?: string;
  },
  userId?: string,
) {
  if (input.cohortId) {
    const cohort = await prisma.cohort.findUnique({ where: { id: input.cohortId } });
    if (!cohort) {
      throw new AppError(400, "INVALID_COHORT", "Cohort not found");
    }
  }

  return prisma.fellowshipApplication.create({
    data: {
      userId,
      fullName: input.fullName,
      email: input.email.toLowerCase(),
      background: input.background,
      motivation: input.motivation,
      cohortId: input.cohortId,
    },
  });
}

export async function listMyApplications(userId: string) {
  return prisma.fellowshipApplication.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });
}

export async function getApplication(id: string, requester: { id: string; role: string }) {
  const app = await prisma.fellowshipApplication.findUnique({ where: { id } });
  if (!app) {
    throw new AppError(404, "NOT_FOUND", "Application not found");
  }
  if (requester.role !== "admin" && app.userId !== requester.id) {
    throw new AppError(403, "FORBIDDEN", "Not allowed to view this application");
  }
  return app;
}

export async function adminListApplications(status?: ApplicationStatus) {
  return prisma.fellowshipApplication.findMany({
    where: status ? { status } : undefined,
    orderBy: { createdAt: "desc" },
  });
}

export async function adminPatchApplication(
  id: string,
  input: { status: ApplicationStatus; cohortId?: string | null },
  actorUserId: string,
) {
  const existing = await prisma.fellowshipApplication.findUnique({ where: { id } });
  if (!existing) {
    throw new AppError(404, "NOT_FOUND", "Application not found");
  }

  const updated = await prisma.fellowshipApplication.update({
    where: { id },
    data: {
      status: input.status,
      ...(input.cohortId !== undefined ? { cohortId: input.cohortId } : {}),
    },
  });

  await prisma.auditLog.create({
    data: {
      actorUserId,
      action: "application.status_update",
      entityType: "fellowship_application",
      entityId: id,
      meta: { status: input.status, cohortId: input.cohortId ?? null },
    },
  });

  return updated;
}

export async function createCohort(input: {
  name: string;
  startsOn?: string;
  endsOn?: string;
  isActive?: boolean;
}) {
  return prisma.cohort.create({
    data: {
      name: input.name,
      startsOn: input.startsOn ? new Date(input.startsOn) : null,
      endsOn: input.endsOn ? new Date(input.endsOn) : null,
      isActive: input.isActive ?? false,
    },
  });
}

export async function patchCohort(
  id: string,
  input: {
    name?: string;
    startsOn?: string | null;
    endsOn?: string | null;
    isActive?: boolean;
  },
) {
  const existing = await prisma.cohort.findUnique({ where: { id } });
  if (!existing) {
    throw new AppError(404, "NOT_FOUND", "Cohort not found");
  }

  return prisma.cohort.update({
    where: { id },
    data: {
      name: input.name,
      startsOn:
        input.startsOn === undefined
          ? undefined
          : input.startsOn === null
            ? null
            : new Date(input.startsOn),
      endsOn:
        input.endsOn === undefined
          ? undefined
          : input.endsOn === null
            ? null
            : new Date(input.endsOn),
      isActive: input.isActive,
    },
  });
}

export async function adminListUsers() {
  return prisma.user.findMany({
    select: {
      id: true,
      email: true,
      displayName: true,
      role: true,
      isActive: true,
      createdAt: true,
    },
    orderBy: { createdAt: "desc" },
  });
}
