/*
  Warnings:

  - The values [PROCESSING,SHIPPED,RETURNED,REFUNDED] on the enum `SellerOrderStatus` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "SellerOrderStatus_new" AS ENUM ('ORDER_CREATED', 'PAYMENT_PENDING', 'PAYMENT_FAILED', 'ORDER_PROCESSING', 'SHIPPING', 'DELIVERED', 'RETURN_WINDOW_OPEN', 'FAILED', 'PAID', 'RETURN_REQUESTED', 'RETURN_PROCESSING', 'REFUND_INITIATED', 'RETURNED_SUCCESS', 'CANCELLED', 'COMPLETED');
ALTER TABLE "SellerOrderItem" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "SellerOrderItem" ALTER COLUMN "status" TYPE "SellerOrderStatus_new" USING ("status"::text::"SellerOrderStatus_new");
ALTER TYPE "SellerOrderStatus" RENAME TO "SellerOrderStatus_old";
ALTER TYPE "SellerOrderStatus_new" RENAME TO "SellerOrderStatus";
DROP TYPE "SellerOrderStatus_old";
ALTER TABLE "SellerOrderItem" ALTER COLUMN "status" SET DEFAULT 'PAID';
COMMIT;
