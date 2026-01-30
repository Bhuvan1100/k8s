/*
  Warnings:

  - Added the required column `billingSnapshot` to the `Order` table without a default value. This is not possible if the table is not empty.
  - Added the required column `productVariantId` to the `OrderItem` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "CheckoutSessionStatus" AS ENUM ('PREVIEW', 'DETAILS_FILLED', 'PAYMENT_PENDING', 'PAID', 'EXPIRED', 'CANCELLED');

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "OrderStatus" ADD VALUE 'ORDER_CREATED';
ALTER TYPE "OrderStatus" ADD VALUE 'FAILED';
ALTER TYPE "OrderStatus" ADD VALUE 'PAID';

-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "billingSnapshot" JSONB NOT NULL,
ALTER COLUMN "status" SET DEFAULT 'PAYMENT_PENDING';

-- AlterTable
ALTER TABLE "OrderItem" ADD COLUMN     "productVariantId" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "CheckoutSession" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "cartId" TEXT,
    "status" "CheckoutSessionStatus" NOT NULL DEFAULT 'PREVIEW',
    "itemsSnapshot" JSONB NOT NULL,
    "buyerDetailsSnapshot" JSONB,
    "shippingDetailsSnapshot" JSONB,
    "pricingSnapshot" JSONB,
    "orderId" TEXT,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CheckoutSession_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "CheckoutSession_userId_idx" ON "CheckoutSession"("userId");

-- CreateIndex
CREATE INDEX "CheckoutSession_status_idx" ON "CheckoutSession"("status");

-- CreateIndex
CREATE INDEX "CheckoutSession_expiresAt_idx" ON "CheckoutSession"("expiresAt");

-- CreateIndex
CREATE INDEX "OrderItem_productVariantId_idx" ON "OrderItem"("productVariantId");
