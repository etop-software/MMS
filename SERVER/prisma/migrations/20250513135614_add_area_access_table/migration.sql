/*
  Warnings:

  - You are about to drop the column `areaAccess` on the `Employee` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Employee" DROP COLUMN "areaAccess";

-- CreateTable
CREATE TABLE "AreaAccess" (
    "id" SERIAL NOT NULL,
    "employeeId" INTEGER NOT NULL,
    "areaId" INTEGER NOT NULL,

    CONSTRAINT "AreaAccess_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DeviceAccess" (
    "id" SERIAL NOT NULL,
    "employeeId" INTEGER NOT NULL,
    "deviceId" INTEGER NOT NULL,
    "areaId" INTEGER NOT NULL,

    CONSTRAINT "DeviceAccess_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "AreaAccess" ADD CONSTRAINT "AreaAccess_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DeviceAccess" ADD CONSTRAINT "DeviceAccess_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
