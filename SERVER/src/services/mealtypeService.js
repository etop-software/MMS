// services/mealType.service.js
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function getNextSlot(tx, areaId) {
    const used = await tx.mealType.findMany({
      where: { areaId },
      select: { mealTypeId: true },
    });
    const usedSet = new Set(used.map(u => u.mealTypeId));
  
    for (let slot = 2; slot <= 50; slot++) {
      if (!usedSet.has(slot)) {
        return slot;
      }
    }
    throw new Error('All 50 meal‑type slots are already taken for this area.');
  }
  
  async function createMealType({ areaId, name, description }) {
    return prisma.$transaction(async tx => {
      const slot = await getNextSlot(tx, areaId);
      return tx.mealType.create({
        data: { mealTypeId: slot, areaId, name, description },
      });
    });
  }


const getAllMealTypes = () => {
  return prisma.mealType.findMany();
};

const getMealType = (mealTypeId, areaId) => {
  return prisma.mealType.findUnique({
    where: {
      mealTypeId_areaId: {
        mealTypeId: parseInt(mealTypeId),
        areaId: parseInt(areaId),
      },
    },
  });
};

const updateMealType = (mealTypeId, areaId, data) => {
  return prisma.mealType.update({
    where: {
      mealTypeId_areaId: {
        mealTypeId: parseInt(mealTypeId),
        areaId: parseInt(areaId),
      },
    },
    data,
  });
};

const deleteMealType = (mealTypeId, areaId) => {
  return prisma.mealType.delete({
    where: {
      mealTypeId_areaId: {
        mealTypeId: parseInt(mealTypeId),
        areaId: parseInt(areaId),
      },
    },
  });
};

module.exports = {
  createMealType,
  getAllMealTypes,
  getMealType,
  updateMealType,
  deleteMealType,
};
