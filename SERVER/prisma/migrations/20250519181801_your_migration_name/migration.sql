-- AlterTable
ALTER TABLE "Employee" ALTER COLUMN "startTime" SET DEFAULT '09:00',
ALTER COLUMN "startTime" SET DATA TYPE TEXT,
ALTER COLUMN "endTime" SET DEFAULT '18:00',
ALTER COLUMN "endTime" SET DATA TYPE TEXT;

-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "userType" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserAreaAccess" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "areaId" INTEGER NOT NULL,

    CONSTRAINT "UserAreaAccess_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- AddForeignKey
ALTER TABLE "UserAreaAccess" ADD CONSTRAINT "UserAreaAccess_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserAreaAccess" ADD CONSTRAINT "UserAreaAccess_areaId_fkey" FOREIGN KEY ("areaId") REFERENCES "Area"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
