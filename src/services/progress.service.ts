import { ProgressStatus } from "@prisma/client";
import { prisma } from "../lib/prisma.js";
import { AppError } from "../middleware/errorHandler.js";

function decodeDocSlug(raw: string): string {
  return decodeURIComponent(raw);
}

export async function listProgress(userId: string) {
  return prisma.learningProgress.findMany({
    where: { userId },
    orderBy: { updatedAt: "desc" },
  });
}

export async function upsertProgress(
  userId: string,
  docSlugRaw: string,
  input: { status: "started" | "completed"; progressPct?: number },
) {
  const docSlug = decodeDocSlug(docSlugRaw);
  const progressPct =
    input.progressPct ?? (input.status === "completed" ? 100 : 0);

  return prisma.learningProgress.upsert({
    where: { userId_docSlug: { userId, docSlug } },
    create: {
      userId,
      docSlug,
      status: input.status as ProgressStatus,
      progressPct,
      lastSeenAt: new Date(),
    },
    update: {
      status: input.status as ProgressStatus,
      progressPct,
      lastSeenAt: new Date(),
    },
  });
}

export async function deleteProgress(userId: string, docSlugRaw: string) {
  const docSlug = decodeDocSlug(docSlugRaw);
  try {
    await prisma.learningProgress.delete({
      where: { userId_docSlug: { userId, docSlug } },
    });
  } catch {
    throw new AppError(404, "NOT_FOUND", "Progress not found");
  }
}

export async function listBookmarks(userId: string) {
  return prisma.bookmark.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });
}

export async function putBookmark(userId: string, docSlugRaw: string) {
  const docSlug = decodeDocSlug(docSlugRaw);
  return prisma.bookmark.upsert({
    where: { userId_docSlug: { userId, docSlug } },
    create: { userId, docSlug },
    update: {},
  });
}

export async function deleteBookmark(userId: string, docSlugRaw: string) {
  const docSlug = decodeDocSlug(docSlugRaw);
  try {
    await prisma.bookmark.delete({
      where: { userId_docSlug: { userId, docSlug } },
    });
  } catch {
    throw new AppError(404, "NOT_FOUND", "Bookmark not found");
  }
}
