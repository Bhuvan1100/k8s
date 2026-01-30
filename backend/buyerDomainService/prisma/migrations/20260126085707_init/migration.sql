/*
  Warnings:

  - A unique constraint covering the columns `[cartId,productId,size]` on the table `CartItem` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `size` to the `CartItem` table without a default value. This is not possible if the table is not empty.
  - Added the required column `size` to the `OrderItem` table without a default value. This is not possible if the table is not empty.
  - Made the column `quantity` on table `OrderItem` required. This step will fail if there are existing NULL values in that column.

*/
-- CreateEnum
CREATE TYPE "SizeVariant" AS ENUM ('SMALL', 'MEDIUM', 'LARGE');

-- DropIndex
DROP INDEX "CartItem_cartId_productId_key";

-- AlterTable
ALTER TABLE "CartItem" ADD COLUMN     "size" "SizeVariant" NOT NULL;

-- AlterTable
ALTER TABLE "OrderItem" ADD COLUMN     "size" "SizeVariant" NOT NULL,
ALTER COLUMN "quantity" SET NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "CartItem_cartId_productId_size_key" ON "CartItem"("cartId", "productId", "size");
