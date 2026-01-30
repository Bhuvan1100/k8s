/*
  Warnings:

  - You are about to drop the column `quantity` on the `ProductVariant` table. All the data in the column will be lost.
  - You are about to drop the `Address` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Seller` table. If the table is not empty, all the data it contains will be lost.
  - Made the column `isActive` on table `ProductVariant` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "Address" DROP CONSTRAINT "Address_sellerId_fkey";

-- AlterTable
ALTER TABLE "ProductVariant" DROP COLUMN "quantity",
ADD COLUMN     "availableQuantity" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "reservedQuantity" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "totalQuantity" INTEGER NOT NULL DEFAULT 0,
ALTER COLUMN "isActive" SET NOT NULL,
ALTER COLUMN "isActive" SET DEFAULT true;

-- DropTable
DROP TABLE "Address";

-- DropTable
DROP TABLE "Seller";

-- DropEnum
DROP TYPE "KycStatus";

-- DropEnum
DROP TYPE "SellerStatus";

-- DropEnum
DROP TYPE "SellerType";
