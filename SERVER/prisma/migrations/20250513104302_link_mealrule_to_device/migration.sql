-- AlterTable
ALTER TABLE "MealRule" ADD COLUMN     "deviceId" INTEGER;

-- AddForeignKey
ALTER TABLE "MealRule" ADD CONSTRAINT "MealRule_deviceId_fkey" FOREIGN KEY ("deviceId") REFERENCES "Device"("id") ON DELETE SET NULL ON UPDATE CASCADE;
