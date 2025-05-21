const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function getMealHistory({
  mealTypeId,
  employeePin,
  employeeName,
  startDate,
  endDate,
  limit = 10,
  offset = 0,
}) {
  try {
    const result = await prisma.$queryRaw(`
      SELECT * 
      FROM public.get_user_meal_history(
        ${mealTypeId ?? 'NULL'},
        ${employeePin ?? 'NULL'},
        ${employeeName ? `'${employeeName}'` : 'NULL'},
        '${startDate}',
        '${endDate}',
        ${limit},
        ${offset}
      );
    `);

    return result;
  } catch (error) {
    console.error('Error fetching meal history:', error);
    throw new Error('Failed to fetch meal history');
  }
}

module.exports = {
  getMealHistory,
};
