-- CreateTable
CREATE TABLE "Employee" (
    "id" SERIAL NOT NULL,
    "pin" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "group" INTEGER NOT NULL,
    "privilege" INTEGER NOT NULL,
    "startTime" TEXT NOT NULL,
    "endTime" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Employee_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Employee_pin_key" ON "Employee"("pin");
