// mealRuleService.js

// Factory function to create a fresh rule data object
const createNewRuleData = (mealTypeId) => {
  return {
    cmdId: `${mealTypeId}`,
    timezoneId: `${mealTypeId}`,
    intervalsByDay: {
      Mon: [{ start: "00:00", end: "00:00" }],
      Tue: [{ start: "00:00", end: "00:00" }],
      Wed: [{ start: "00:00", end: "00:00" }],
      Thu: [{ start: "00:00", end: "00:00" }],
      Fri: [{ start: "00:00", end: "00:00" }],
      Sat: [{ start: "00:00", end: "00:00" }],
      Sun: [{ start: "00:00", end: "00:00" }],
      Hol1: [{ start: "00:00", end: "00:00" }],
      Hol2: [{ start: "00:00", end: "00:00" }],
      Hol3: [{ start: "00:00", end: "00:00" }]
    }
  };
};

// Function to update rule data for a specific mealTypeId
const updateMealRule = (mealTypeId, startTime, endTime, days) => {
  const ruleData = createNewRuleData(mealTypeId);

  days.forEach(day => {
    if (ruleData.intervalsByDay[day]) {
      ruleData.intervalsByDay[day][0] = {
        start: startTime,
        end: endTime
      };
    }
  });

  return ruleData;
};

module.exports = {
  updateMealRule
};
