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
