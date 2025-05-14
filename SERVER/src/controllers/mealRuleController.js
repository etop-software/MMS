const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient(); // adjust path as needed
const mealRuleService = require('../services/mealRuleService');
const eventEmitter = require('../eventEmitter');
const { generateTimezoneCommandService } = require('../services/timezoneService');



const updateMealRule = async (req, res) => {
  const { mealTypeId, startTime, endTime, days, areaId, deviceId } = req.body;

  try {
    // Ensure you have valid deviceId if it's provided
    const mealRule = await prisma.mealRule.upsert({
      where: {
        mealTypeId_areaId_deviceId: { // Use the composite key for upsert
          mealTypeId,
          areaId,
          deviceId, // This ensures we are updating/creating a rule specific to the mealType, area, and device
        }
      },
      update: {
        startTime,
        endTime,
        days
      },
      create: {
        mealTypeId,
        areaId,
        deviceId, // Include deviceId in the create operation
        startTime,
        endTime,
        days
      }
    });

    const updatedRuleData = mealRuleService.updateMealRule(mealTypeId, startTime, endTime, days);
    const { cmdId, timezoneId, intervalsByDay } = updatedRuleData;

    const command = generateTimezoneCommandService(cmdId, timezoneId, intervalsByDay);

   const device = await prisma.device.findUnique({
      where: {
        id: deviceId, // Ensure the deviceId exists in your device table
      }
    });

    // Assuming the device object has a field 'SN' for Serial Number
    const SN = device ? device.SN : null;

    console.log('SN:', SN);

    eventEmitter.emit('newTimeZone', { command, SN });

    return res.json({
      message: `Meal rule Inserted/updated`,
      data: command,
      success: true,
      rule: mealRule
    });
  } catch (error) {
    console.error(error);
    return res.status(400).json({ error: error.message });
  }
};


const getMealRules = async (req, res) => {
  try {
    // Fetch meal rules along with related mealType and area
    const mealRules = await prisma.mealRule.findMany({
      include: {
        mealType: true,
        area: true,
        device: true,
      }
    });

    if (mealRules.length === 0) {
      return res.status(404).json({ message: 'No meal rules found' });
    }

    return res.json({
      message: 'Meal rules fetched successfully',
      data: mealRules
    });

  } catch (error) {
    console.error('Error fetching meal rules:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};


module.exports = {
  updateMealRule,
  getMealRules
};
