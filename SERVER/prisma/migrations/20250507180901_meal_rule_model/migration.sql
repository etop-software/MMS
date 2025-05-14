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
    "areaId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,

    CONSTRAINT "MealType_pkey" PRIMARY KEY ("mealTypeId","areaId")
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

    CONSTRAINT "MealRule_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "MealRule_mealTypeId_areaId_key" ON "MealRule"("mealTypeId", "areaId");

-- AddForeignKey
ALTER TABLE "MealType" ADD CONSTRAINT "MealType_areaId_fkey" FOREIGN KEY ("areaId") REFERENCES "Area"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MealRule" ADD CONSTRAINT "MealRule_mealTypeId_areaId_fkey" FOREIGN KEY ("mealTypeId", "areaId") REFERENCES "MealType"("mealTypeId", "areaId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MealRule" ADD CONSTRAINT "MealRule_areaId_fkey" FOREIGN KEY ("areaId") REFERENCES "Area"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
