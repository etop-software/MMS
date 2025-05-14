/*
  Warnings:

  - The primary key for the `MealType` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `areaId` on the `MealType` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[mealTypeId,areaId,deviceId]` on the table `MealRule` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "MealRule" DROP CONSTRAINT "MealRule_mealTypeId_areaId_fkey";

-- DropForeignKey
ALTER TABLE "MealType" DROP CONSTRAINT "MealType_areaId_fkey";

-- DropIndex
DROP INDEX "MealRule_mealTypeId_areaId_key";

-- AlterTable
ALTER TABLE "MealType" DROP CONSTRAINT "MealType_pkey",
DROP COLUMN "areaId",
ADD CONSTRAINT "MealType_pkey" PRIMARY KEY ("mealTypeId");

-- CreateIndex
CREATE UNIQUE INDEX "MealRule_mealTypeId_areaId_deviceId_key" ON "MealRule"("mealTypeId", "areaId", "deviceId");

-- AddForeignKey
ALTER TABLE "MealRule" ADD CONSTRAINT "MealRule_mealTypeId_fkey" FOREIGN KEY ("mealTypeId") REFERENCES "MealType"("mealTypeId") ON DELETE RESTRICT ON UPDATE CASCADE;
