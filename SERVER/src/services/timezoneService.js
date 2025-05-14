const { generateTimezoneCommand } = require('../utils/timeUtils');

const generateTimezoneCommandService = (cmdId, timezoneId, intervalsByDay) => {

  if (!cmdId || !timezoneId || !intervalsByDay) {
    throw new Error('cmdId, timezoneId, and intervalsByDay are required.');
  }
  return generateTimezoneCommand(cmdId, timezoneId, intervalsByDay);
};

module.exports = {
  generateTimezoneCommandService
};
