/*
  Warnings:

  - Added the required column `paymentMethod` to the `Order` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `Order` ADD COLUMN `paymentMethod` VARCHAR(191) NOT NULL;
