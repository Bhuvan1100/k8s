-- CreateEnum
CREATE TYPE "SellerOrderStatus" AS ENUM ('PAID', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'RETURN_REQUESTED', 'RETURNED', 'REFUNDED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "Size" AS ENUM ('SMALL', 'MEDIUM', 'LARGE');

-- AlterTable
ALTER TABLE "Seller" ADD COLUMN     "totalRevenue" DECIMAL(65,30);

-- CreateTable
CREATE TABLE "SellerProduct" (
    "id" TEXT NOT NULL,
    "sellerId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "defaultImage" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SellerProduct_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SellerProductVariant" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "productVariantId" TEXT NOT NULL,
    "size" "Size" NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SellerProductVariant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SellerOrderItem" (
    "id" TEXT NOT NULL,
    "sellerId" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "productVariantId" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "priceSnapshot" DECIMAL(65,30) NOT NULL,
    "status" "SellerOrderStatus" NOT NULL DEFAULT 'PAID',
    "soldAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "shippedAt" TIMESTAMP(3),
    "deliveredAt" TIMESTAMP(3),
    "refundedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SellerOrderItem_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "SellerProduct_sellerId_idx" ON "SellerProduct"("sellerId");

-- CreateIndex
CREATE UNIQUE INDEX "SellerProductVariant_productVariantId_key" ON "SellerProductVariant"("productVariantId");

-- CreateIndex
CREATE INDEX "SellerProductVariant_productId_idx" ON "SellerProductVariant"("productId");

-- CreateIndex
CREATE INDEX "SellerOrderItem_sellerId_idx" ON "SellerOrderItem"("sellerId");

-- CreateIndex
CREATE INDEX "SellerOrderItem_orderId_idx" ON "SellerOrderItem"("orderId");

-- CreateIndex
CREATE INDEX "SellerOrderItem_productId_idx" ON "SellerOrderItem"("productId");

-- AddForeignKey
ALTER TABLE "SellerProduct" ADD CONSTRAINT "SellerProduct_sellerId_fkey" FOREIGN KEY ("sellerId") REFERENCES "Seller"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SellerProductVariant" ADD CONSTRAINT "SellerProductVariant_productId_fkey" FOREIGN KEY ("productId") REFERENCES "SellerProduct"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SellerOrderItem" ADD CONSTRAINT "SellerOrderItem_sellerId_fkey" FOREIGN KEY ("sellerId") REFERENCES "Seller"("id") ON DELETE CASCADE ON UPDATE CASCADE;
