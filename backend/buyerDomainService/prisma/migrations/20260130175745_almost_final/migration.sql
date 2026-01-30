/*
  Warnings:

  - Added the required column `billingSnapshot` to the `Order` table without a default value. This is not possible if the table is not empty.

*/
-- AlterEnum
ALTER TYPE "OrderStatus" ADD VALUE 'RETURNED';

-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "billingSnapshot" JSONB NOT NULL,
ALTER COLUMN "status" SET DEFAULT 'PAID',
ALTER COLUMN "addressSnapshot" DROP NOT NULL;
