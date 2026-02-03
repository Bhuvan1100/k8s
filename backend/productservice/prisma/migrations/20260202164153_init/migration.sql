/*
  Warnings:

  - A unique constraint covering the columns `[sellerId,title,category,subCategory]` on the table `Product` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Product_sellerId_title_category_subCategory_key" ON "Product"("sellerId", "title", "category", "subCategory");
