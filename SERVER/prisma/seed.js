// prisma/seed.ts (or .js)
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const areas = [
    { id: 1, name: "Main Cafeteria", description: "Primary dining area for all employees" },
    { id: 2, name: "Executive Lounge", description: "Dining area for executives and senior management" },
    { id: 3, name: "Engineering Wing", description: "Snack area in the engineering department" },
  ];

  await prisma.area.createMany({
    data: areas,
    skipDuplicates: true,
  });

  const mealTypes = [
    { mealTypeId: 2, areaId: 1, name: "Breakfast", description: "Morning meal options" },
    { mealTypeId: 3, areaId: 1, name: "Lunch", description: "Midday meal options" },
    { mealTypeId: 4, areaId: 1, name: "Dinner", description: "Evening meal options" },
    { mealTypeId: 2, areaId: 2, name: "Breakfast", description: "Exec breakfast" },
    { mealTypeId: 3, areaId: 2, name: "Lunch", description: "Exec lunch" },
    { mealTypeId: 4, areaId: 2, name: "Dinner", description: "Exec dinner" },
    { mealTypeId: 2, areaId: 3, name: "Breakfast", description: "Eng breakfast" },
    { mealTypeId: 3, areaId: 3, name: "Lunch", description: "Eng lunch" },
    { mealTypeId: 4, areaId: 3, name: "Dinner", description: "Eng dinner" },
  ];

  await prisma.mealType.createMany({
    data: mealTypes,
    skipDuplicates: true,
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
