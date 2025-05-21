-- CreateTable
CREATE TABLE "EmployeeMealAccess" (
    "id" SERIAL NOT NULL,
    "employeeId" INTEGER NOT NULL,
    "areaId" INTEGER NOT NULL,
    "deviceId" INTEGER NOT NULL,
    "mealRuleId" INTEGER NOT NULL,

    CONSTRAINT "EmployeeMealAccess_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "EmployeeMealAccess_employeeId_areaId_deviceId_mealRuleId_key" ON "EmployeeMealAccess"("employeeId", "areaId", "deviceId", "mealRuleId");

-- AddForeignKey
ALTER TABLE "EmployeeMealAccess" ADD CONSTRAINT "EmployeeMealAccess_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmployeeMealAccess" ADD CONSTRAINT "EmployeeMealAccess_areaId_fkey" FOREIGN KEY ("areaId") REFERENCES "Area"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmployeeMealAccess" ADD CONSTRAINT "EmployeeMealAccess_deviceId_fkey" FOREIGN KEY ("deviceId") REFERENCES "Device"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmployeeMealAccess" ADD CONSTRAINT "EmployeeMealAccess_mealRuleId_fkey" FOREIGN KEY ("mealRuleId") REFERENCES "MealRule"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
