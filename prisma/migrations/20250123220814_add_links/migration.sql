/*
  Warnings:

  - You are about to drop the column `updatedAt` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `Vote` table. All the data in the column will be lost.
  - You are about to drop the column `urlId` on the `Vote` table. All the data in the column will be lost.
  - You are about to drop the `Session` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Url` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[userId,linkId]` on the table `Vote` will be added. If there are existing duplicate values, this will fail.
  - Made the column `avatarUrl` on table `User` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `linkId` to the `Vote` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Session" DROP CONSTRAINT "Session_userId_fkey";

-- DropForeignKey
ALTER TABLE "Vote" DROP CONSTRAINT "Vote_urlId_fkey";

-- DropForeignKey
ALTER TABLE "Vote" DROP CONSTRAINT "Vote_userId_fkey";

-- DropIndex
DROP INDEX "Vote_urlId_userId_key";

-- AlterTable
ALTER TABLE "User" DROP COLUMN "updatedAt",
ALTER COLUMN "avatarUrl" SET NOT NULL;

-- AlterTable
ALTER TABLE "Vote" DROP COLUMN "updatedAt",
DROP COLUMN "urlId",
ADD COLUMN     "linkId" TEXT NOT NULL;

-- DropTable
DROP TABLE "Session";

-- DropTable
DROP TABLE "Url";

-- CreateTable
CREATE TABLE "Link" (
    "id" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "imageUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdById" TEXT NOT NULL,

    CONSTRAINT "Link_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Link_createdById_idx" ON "Link"("createdById");

-- CreateIndex
CREATE INDEX "Vote_userId_idx" ON "Vote"("userId");

-- CreateIndex
CREATE INDEX "Vote_linkId_idx" ON "Vote"("linkId");

-- CreateIndex
CREATE UNIQUE INDEX "Vote_userId_linkId_key" ON "Vote"("userId", "linkId");
