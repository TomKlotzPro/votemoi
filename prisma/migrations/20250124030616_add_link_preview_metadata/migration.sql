/*
  Warnings:

  - You are about to drop the column `imageUrl` on the `Link` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Link" DROP COLUMN "imageUrl",
ADD COLUMN     "previewDescription" TEXT,
ADD COLUMN     "previewFavicon" TEXT,
ADD COLUMN     "previewImage" TEXT,
ADD COLUMN     "previewSiteName" TEXT,
ADD COLUMN     "previewTitle" TEXT;
