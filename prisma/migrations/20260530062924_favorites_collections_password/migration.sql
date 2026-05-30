/*
  Warnings:

  - You are about to drop the column `password` on the `Paste` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "flowpaste"."Paste" DROP COLUMN "password",
ADD COLUMN     "isFavorite" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "passwordHash" TEXT;

-- CreateTable
CREATE TABLE "flowpaste"."Collection" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Collection_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "flowpaste"."PasteCollection" (
    "pasteId" TEXT NOT NULL,
    "collectionId" TEXT NOT NULL,
    "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PasteCollection_pkey" PRIMARY KEY ("pasteId","collectionId")
);

-- CreateIndex
CREATE INDEX "Collection_createdAt_idx" ON "flowpaste"."Collection"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "Collection_name_key" ON "flowpaste"."Collection"("name");

-- CreateIndex
CREATE INDEX "PasteCollection_collectionId_idx" ON "flowpaste"."PasteCollection"("collectionId");

-- CreateIndex
CREATE INDEX "Paste_isFavorite_createdAt_idx" ON "flowpaste"."Paste"("isFavorite", "createdAt");

-- AddForeignKey
ALTER TABLE "flowpaste"."PasteCollection" ADD CONSTRAINT "PasteCollection_pasteId_fkey" FOREIGN KEY ("pasteId") REFERENCES "flowpaste"."Paste"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "flowpaste"."PasteCollection" ADD CONSTRAINT "PasteCollection_collectionId_fkey" FOREIGN KEY ("collectionId") REFERENCES "flowpaste"."Collection"("id") ON DELETE CASCADE ON UPDATE CASCADE;
