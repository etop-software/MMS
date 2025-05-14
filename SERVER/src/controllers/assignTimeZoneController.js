
const { buildAuthorizationCommand } = require('../services/userAuthService');
const eventEmitter = require('../eventEmitter');

function assignTimeZone(req, res) {
  console.log(req.body);
 
  const command = buildAuthorizationCommand(req.body);

  eventEmitter.emit('assignTimeZoneCommand', command);

  res.status(200).json({ success: true, command });
}

module.exports = { assignTimeZone };
