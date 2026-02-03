/*
  Warnings:

  - You are about to drop the column `sellerId` on the `Address` table. All the data in the column will be lost.
  - You are about to drop the column `sellerId` on the `SellerOrderItem` table. All the data in the column will be lost.
  - You are about to drop the column `sellerId` on the `SellerProduct` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[sellerUserId]` on the table `Address` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `sellerUserId` to the `Address` table without a default value. This is not possible if the table is not empty.
  - Added the required column `sellerUserId` to the `SellerOrderItem` table without a default value. This is not possible if the table is not empty.
  - Added the required column `sellerUserId` to the `SellerProduct` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Address" DROP CONSTRAINT "Address_sellerId_fkey";

-- DropForeignKey
ALTER TABLE "SellerOrderItem" DROP CONSTRAINT "SellerOrderItem_sellerId_fkey";

-- DropForeignKey
ALTER TABLE "SellerProduct" DROP CONSTRAINT "SellerProduct_sellerId_fkey";

-- DropIndex
DROP INDEX "Address_sellerId_key";

-- DropIndex
DROP INDEX "SellerOrderItem_sellerId_idx";

-- DropIndex
DROP INDEX "SellerProduct_sellerId_idx";

-- AlterTable
ALTER TABLE "Address" DROP COLUMN "sellerId",
ADD COLUMN     "sellerUserId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "SellerOrderItem" DROP COLUMN "sellerId",
ADD COLUMN     "sellerUserId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "SellerProduct" DROP COLUMN "sellerId",
ADD COLUMN     "sellerUserId" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Address_sellerUserId_key" ON "Address"("sellerUserId");

-- CreateIndex
CREATE INDEX "SellerOrderItem_sellerUserId_idx" ON "SellerOrderItem"("sellerUserId");

-- CreateIndex
CREATE INDEX "SellerProduct_sellerUserId_idx" ON "SellerProduct"("sellerUserId");

-- AddForeignKey
ALTER TABLE "Address" ADD CONSTRAINT "Address_sellerUserId_fkey" FOREIGN KEY ("sellerUserId") REFERENCES "Seller"("userId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SellerProduct" ADD CONSTRAINT "SellerProduct_sellerUserId_fkey" FOREIGN KEY ("sellerUserId") REFERENCES "Seller"("userId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SellerOrderItem" ADD CONSTRAINT "SellerOrderItem_sellerUserId_fkey" FOREIGN KEY ("sellerUserId") REFERENCES "Seller"("userId") ON DELETE CASCADE ON UPDATE CASCADE;
