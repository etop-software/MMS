-- CreateTable
CREATE TABLE "Employee" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "group" INTEGER,
    "privilege" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "pin" INTEGER NOT NULL,
    "email" TEXT,
    "employeeId" INTEGER,
    "departmentId" INTEGER,
    "phone" TEXT,
    "password" TEXT,
    "RFID" TEXT,
    "startTime" TEXT DEFAULT '09:00',
    "endTime" TEXT DEFAULT '18:00',

    CONSTRAINT "Employee_pkey" PRIMARY KEY ("id")
);

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

-- CreateTable
CREATE TABLE "Department" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,

    CONSTRAINT "Department_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Device" (
    "id" SERIAL NOT NULL,
    "deviceName" TEXT NOT NULL,
    "SN" TEXT NOT NULL,
    "areaId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "faceCount" INTEGER,
    "fpCount" INTEGER,
    "ipAddress" TEXT,
    "transactionCount" INTEGER,
    "userCount" INTEGER,

    CONSTRAINT "Device_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Area" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,

    CONSTRAINT "Area_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MealType" (
    "mealTypeId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,

    CONSTRAINT "MealType_pkey" PRIMARY KEY ("mealTypeId")
);

-- CreateTable
CREATE TABLE "MealRule" (
    "id" SERIAL NOT NULL,
    "mealTypeId" INTEGER NOT NULL,
    "areaId" INTEGER NOT NULL,
    "startTime" TEXT NOT NULL,
    "endTime" TEXT NOT NULL,
    "days" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deviceId" INTEGER,

    CONSTRAINT "MealRule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Logs" (
    "id" SERIAL NOT NULL,
    "time" TIMESTAMP(3) NOT NULL,
    "pin" INTEGER NOT NULL,
    "cardno" INTEGER NOT NULL,
    "eventaddr" INTEGER NOT NULL,
    "event" INTEGER NOT NULL,
    "inoutstatus" INTEGER NOT NULL,
    "verifytype" INTEGER NOT NULL,
    "index" INTEGER NOT NULL,
    "sitecode" INTEGER NOT NULL,
    "linkid" INTEGER NOT NULL,
    "maskflag" INTEGER NOT NULL,
    "temperature" INTEGER NOT NULL,
    "convtemperature" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "userType" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "needToChangePassword" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserAreaAccess" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "areaId" INTEGER NOT NULL,

    CONSTRAINT "UserAreaAccess_pkey" PRIMARY KEY ("id")
);

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
CREATE UNIQUE INDEX "Employee_pin_key" ON "Employee"("pin");

-- CreateIndex
CREATE UNIQUE INDEX "Device_SN_key" ON "Device"("SN");

-- CreateIndex
CREATE UNIQUE INDEX "MealRule_mealTypeId_areaId_deviceId_key" ON "MealRule"("mealTypeId", "areaId", "deviceId");

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- CreateIndex
CREATE UNIQUE INDEX "EmployeeMealAccess_employeeId_areaId_deviceId_mealRuleId_key" ON "EmployeeMealAccess"("employeeId", "areaId", "deviceId", "mealRuleId");

-- AddForeignKey
ALTER TABLE "Employee" ADD CONSTRAINT "Employee_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "Department"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AreaAccess" ADD CONSTRAINT "AreaAccess_areaId_fkey" FOREIGN KEY ("areaId") REFERENCES "Area"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AreaAccess" ADD CONSTRAINT "AreaAccess_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DeviceAccess" ADD CONSTRAINT "DeviceAccess_areaId_fkey" FOREIGN KEY ("areaId") REFERENCES "Area"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DeviceAccess" ADD CONSTRAINT "DeviceAccess_deviceId_fkey" FOREIGN KEY ("deviceId") REFERENCES "Device"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DeviceAccess" ADD CONSTRAINT "DeviceAccess_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Device" ADD CONSTRAINT "Device_areaId_fkey" FOREIGN KEY ("areaId") REFERENCES "Area"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MealRule" ADD CONSTRAINT "MealRule_areaId_fkey" FOREIGN KEY ("areaId") REFERENCES "Area"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MealRule" ADD CONSTRAINT "MealRule_deviceId_fkey" FOREIGN KEY ("deviceId") REFERENCES "Device"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MealRule" ADD CONSTRAINT "MealRule_mealTypeId_fkey" FOREIGN KEY ("mealTypeId") REFERENCES "MealType"("mealTypeId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserAreaAccess" ADD CONSTRAINT "UserAreaAccess_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserAreaAccess" ADD CONSTRAINT "UserAreaAccess_areaId_fkey" FOREIGN KEY ("areaId") REFERENCES "Area"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmployeeMealAccess" ADD CONSTRAINT "EmployeeMealAccess_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmployeeMealAccess" ADD CONSTRAINT "EmployeeMealAccess_areaId_fkey" FOREIGN KEY ("areaId") REFERENCES "Area"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmployeeMealAccess" ADD CONSTRAINT "EmployeeMealAccess_deviceId_fkey" FOREIGN KEY ("deviceId") REFERENCES "Device"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmployeeMealAccess" ADD CONSTRAINT "EmployeeMealAccess_mealRuleId_fkey" FOREIGN KEY ("mealRuleId") REFERENCES "MealRule"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
