-- CreateEnum
CREATE TYPE "flowpaste"."PasteVisibility" AS ENUM ('public', 'private', 'unlisted');

-- CreateTable
CREATE TABLE "flowpaste"."Paste" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "language" TEXT NOT NULL,
    "description" TEXT,
    "visibility" "flowpaste"."PasteVisibility" NOT NULL DEFAULT 'public',
    "password" TEXT,
    "expiresAt" TIMESTAMP(3),
    "views" INTEGER NOT NULL DEFAULT 0,
    "shares" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Paste_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Paste_createdAt_idx" ON "flowpaste"."Paste"("createdAt");

-- CreateIndex
CREATE INDEX "Paste_visibility_createdAt_idx" ON "flowpaste"."Paste"("visibility", "createdAt");

-- CreateIndex
CREATE INDEX "Paste_language_createdAt_idx" ON "flowpaste"."Paste"("language", "createdAt");
