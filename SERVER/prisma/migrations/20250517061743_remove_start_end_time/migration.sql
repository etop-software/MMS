/*
  Warnings:

  - The `startTime` column on the `Employee` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `endTime` column on the `Employee` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "Device" ADD COLUMN     "faceCount" INTEGER,
ADD COLUMN     "fpCount" INTEGER,
ADD COLUMN     "ipAddress" TEXT,
ADD COLUMN     "transactionCount" INTEGER,
ADD COLUMN     "userCount" INTEGER;

-- AlterTable
ALTER TABLE "Employee" ALTER COLUMN "group" DROP NOT NULL,
ALTER COLUMN "privilege" DROP NOT NULL,
DROP COLUMN "startTime",
ADD COLUMN     "startTime" TIMESTAMP(3),
DROP COLUMN "endTime",
ADD COLUMN     "endTime" TIMESTAMP(3);
