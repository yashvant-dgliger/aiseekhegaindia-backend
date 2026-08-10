-- CreateEnum
CREATE TYPE "Role" AS ENUM ('learner', 'mentor', 'admin');

-- CreateEnum
CREATE TYPE "ProgressStatus" AS ENUM ('started', 'completed');

-- CreateEnum
CREATE TYPE "ApplicationStatus" AS ENUM ('submitted', 'reviewing', 'accepted', 'rejected', 'waitlisted');

-- CreateTable
CREATE TABLE "users" (
    "id" UUID NOT NULL,
    "email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "display_name" TEXT,
    "role" "Role" NOT NULL DEFAULT 'learner',
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "refresh_tokens" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "token_hash" TEXT NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "revoked_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "refresh_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "learning_progress" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "doc_slug" TEXT NOT NULL,
    "status" "ProgressStatus" NOT NULL,
    "progress_pct" INTEGER NOT NULL DEFAULT 0,
    "last_seen_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "learning_progress_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bookmarks" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "doc_slug" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "bookmarks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cohorts" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "starts_on" DATE,
    "ends_on" DATE,
    "is_active" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "cohorts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "fellowship_applications" (
    "id" UUID NOT NULL,
    "user_id" UUID,
    "full_name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "background" TEXT,
    "motivation" TEXT,
    "status" "ApplicationStatus" NOT NULL DEFAULT 'submitted',
    "cohort_id" UUID,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "fellowship_applications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" UUID NOT NULL,
    "actor_user_id" UUID,
    "action" TEXT NOT NULL,
    "entity_type" TEXT NOT NULL,
    "entity_id" TEXT,
    "meta" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "refresh_tokens_user_id_idx" ON "refresh_tokens"("user_id");

-- CreateIndex
CREATE INDEX "learning_progress_user_id_idx" ON "learning_progress"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "learning_progress_user_id_doc_slug_key" ON "learning_progress"("user_id", "doc_slug");

-- CreateIndex
CREATE INDEX "bookmarks_user_id_idx" ON "bookmarks"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "bookmarks_user_id_doc_slug_key" ON "bookmarks"("user_id", "doc_slug");

-- CreateIndex
CREATE INDEX "fellowship_applications_email_idx" ON "fellowship_applications"("email");

-- CreateIndex
CREATE INDEX "fellowship_applications_status_idx" ON "fellowship_applications"("status");

-- AddForeignKey
ALTER TABLE "refresh_tokens" ADD CONSTRAINT "refresh_tokens_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "learning_progress" ADD CONSTRAINT "learning_progress_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bookmarks" ADD CONSTRAINT "bookmarks_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fellowship_applications" ADD CONSTRAINT "fellowship_applications_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fellowship_applications" ADD CONSTRAINT "fellowship_applications_cohort_id_fkey" FOREIGN KEY ("cohort_id") REFERENCES "cohorts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_actor_user_id_fkey" FOREIGN KEY ("actor_user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

