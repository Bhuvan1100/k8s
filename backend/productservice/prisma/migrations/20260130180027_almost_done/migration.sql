/*
  Warnings:

  - A unique constraint covering the columns `[orderId,productVariantId]` on the table `InventoryReservation` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "ProductVariant" DROP CONSTRAINT "ProductVariant_productId_fkey";

-- DropIndex
DROP INDEX "InventoryReservation_orderId_key";

-- AlterTable
ALTER TABLE "InventoryReservation" ALTER COLUMN "status" SET DEFAULT 'RESERVED';

-- CreateIndex
CREATE UNIQUE INDEX "InventoryReservation_orderId_productVariantId_key" ON "InventoryReservation"("orderId", "productVariantId");

-- AddForeignKey
ALTER TABLE "ProductVariant" ADD CONSTRAINT "ProductVariant_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;
