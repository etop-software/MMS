const eventEmitter = require('../eventEmitter');

const { generateTimezoneCommandService } = require('../services/timezoneService');

const generateTimezoneCommandController = async (req, res) => {
  try {
    const { cmdId, timezoneId, intervalsByDay } = req.body;

    const command = generateTimezoneCommandService(cmdId, timezoneId, intervalsByDay);

    eventEmitter.emit('newTimeZone', command);  

    res.status(200).json({ command });
  } catch (error) {
    console.error('Error generating timezone command:', error);
    res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
};

module.exports = {
  generateTimezoneCommandController,
};
